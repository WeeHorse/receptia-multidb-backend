module.exports = function(app){

  // mssql
  const db = require('mssql');
  async function connectToMsSql(){
    try {
      db.pool = await db.connect({
        user: 'SA',
        password: '<YourStrong@Passw0rd>',
        server: 'localhost', // You can use 'localhost\instance' to connect to named instance
        database: 'nodemusic',
      })
      // let result = await db.pool.request()
      //     .input('colorId', db.Int, 3)
      //     .query('SELECT * FROM master.nodemusic.example_colors WHERE id = @colorId')
      // console.log(result)
    } catch (err) {
      console.trace(err)
    }
  }

  // REST routes (endpoints)

  app.post('/rest/cart-item', async (request, response) => {
    // check if user exists before writing
    if(!request.session.user){
      response.status(401) // unauthorised
      response.json({error:'not logged in'})
      return;
    }
    let cartItem = request.body
    let result = await db.pool.request()
      .input('food', db.Int, cartItem.food)
      .input('amount', db.Int, cartItem.amount)
      .input('user', db.Int, request.session.user.id)
      .query('INSERT INTO cart_items SET food = @food, amount = @amount, user = @user')
    response.json(result)
  })

  app.get('/rest/cart', async (request, response) => {
    // check if user exists before writing
    if(!request.session.user){
      response.status(401) // unauthorised
      response.json({error:'not logged in'})
      return;
    }
    let cart = await db.pool.request()
      .input('user', db.Int, request.session.user.id)
      .query('SELECT * FROM cart WHERE user = @user')
    response.json(cart.recordset)
  })

  app.delete('/rest/cart', async (request, response) => {
    // check if user exists before writing
    if(!request.session.user){
      response.status(401) // unauthorised
      response.json({error:'not logged in'})
      return;
    }
    let result = await db.pool.request()
      .input('user', db.Int, request.session.user.id)
      .query('DELETE * FROM cart_items WHERE user = @user')
    response.json(result)
  })

  app.delete('/rest/cart-item/:id', async (request, response) => {
    // check if user exists before writing
    if(!request.session.user){
      response.status(401) // unauthorised
      response.json({error:'not logged in'})
      return;
    }
    let result = await db.pool.request()
      .input('user', db.Int, request.params.id)
      .input('user', db.Int, request.session.user.id)
      .query('DELETE FROM cart_items WHERE id = @id AND user = @user')
    response.json(result)
  })

  // logga in
  app.post('/rest/login', async (request, response) => {
    let user = await db.pool.request()
      .input('email', db.VarChar, request.body.email)
      .query('SELECT * FROM users WHERE email = @email')
    user = user.recordset[0]
    if(user && user.email && await bcrypt.compare(request.body.password, user.password)){
      request.session.user = user
      user.loggedIn = true
      response.json({loggedIn: true})
    }else{
      response.status(401) // unauthorized  https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
      response.json({message:"no matching user"})
    }
  })

  // autentisera (hämta inloggad användare på denna session - och kontrollera alltid med db)
  app.get('/rest/login', async (request, response) => {
    let user
    if(request.session.user){
      user = await db.pool.request()
        .input('email', db.VarChar, request.session.user.email)
        .input('password', db.VarChar, request.session.user.password)
        .query('SELECT * FROM users WHERE email = @email AND password = @password', [request.session.user.email, request.session.user.password])
      user = user.recordset[0]
    }
    if(user && user.email){
      user.loggedIn = true
      delete(user.password)
      response.json(user)
    }else{
      response.status(401) // unauthorized  https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
      response.json({message:"not logged in"})
    }
  })


  // logga ut
  app.delete('/rest/login', async (request, response) => {
    request.session.destroy( () => {
      response.json({loggedIn: false})
    } )
  })

  return db

}