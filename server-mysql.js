module.exports = function(app){

  // mysql
  const mysql = require('mysql');
  const db = mysql.createConnection({
    host     : 'sql11.freesqldatabase.com',
    user     : 'sql11410314',
    password : 'iwh4WpFe8V',
    database : 'sql11410314'
  });
  // vi gör om metoderna connect och query till promise-metoder så att vi kan använda async/await för att vänta på databasen
  const util = require('util')
  db.connect = util.promisify(db.connect)
  db.query = util.promisify(db.query)

  // REST routes (endpoints)

  app.get("/rest/foods", async (req, res) => {
    let query = "SELECT * FROM foods"
    let result = await db.query(query)
    res.json(result)
  })

  app.post('/rest/cart-item', async (request, response) => {
    // check if user exists before writing
    if(!request.session.user){
      response.status(401) // unauthorised
      response.json({error:'not logged in'})
      return;
    }
    let cartItem = request.body
    let result = await db.query('INSERT INTO cart_items SET food = ?, amount = ?, user = ?', [cartItem.food, cartItem.amount, request.session.user.id])
    response.json(result)
  })

  app.get('/rest/cart', async (request, response) => {
    // check if user exists before writing
    if(!request.session.user){
      response.status(401) // unauthorised
      response.json({error:'not logged in'})
      return;
    }
    let cart = await db.query('SELECT * FROM cart WHERE user = ?', [request.session.user.id])
    response.json(cart)
  })

  app.delete('/rest/cart', async (request, response) => {
    // check if user exists before writing
    if(!request.session.user){
      response.status(401) // unauthorised
      response.json({error:'not logged in'})
      return;
    }
    let result = await db.query('DELETE * FROM cart_items WHERE user = ?', [request.session.user.id])
    response.json(result)
  })

  app.delete('/rest/cart-item/:id', async (request, response) => {
    // check if user exists before writing
    if(!request.session.user){
      response.status(401) // unauthorised
      response.json({error:'not logged in'})
      return;
    }
    let result = await db.query('DELETE FROM cart_items WHERE id = ? AND user = ?', [request.params.id, request.session.user.id])
    response.json(result)
  })

  // registrera en ny användare
  app.post('/rest/users', async (request, response) => {
    let user = request.body
    let result = await db.query('INSERT INTO users SET ?', [user])
    response.json(result)
  })

  // logga in
  app.post('/rest/login', async (request, response) => {
    let user = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [request.body.email, request.body.password])

    user = user[0] // resultatet av min SELECT blir en array, vi är bara intresserade av första elementet (vårt user objekt)

    if(user && user.email){
      request.session.user = user
      user.loggedIn = true
      response.json({loggedIn:true})
    }else{
      response.status(401) // unauthorized  https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
      response.json({loggedIn:false, message:"no matching user"})
    }
  })

  // autentisera (hämta inloggad användare på denna session - och kontrollera alltid med db)
  app.get('/rest/login', async (request, response) => {
    let user
    if(request.session.user){
      user = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [request.session.user.email, request.session.user.password])
      user = user[0]
    }
    if(user && user.email){
      user.loggedIn = true
      delete(user.password) // skicka aldrig password till frontend
      response.json(user)
    }else{
      response.status(401) // unauthorized  https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
      response.json({loggedIn:false, message:"not logged in"})
    }
  })

  // logga ut
  app.delete('/rest/login', async (request, response) => {
    request.session.destroy( () => {
      response.json({loggedIn: false})
    } )
  })

  // Exempel på dynamiska routes:
  /*

  // dynamisk route till vilken tabell som helst, säkerhetsrisk?
  // route där front-end kan hämta data ifrån övriga tabeller
  // ex:   /rest/orders
  // ex:   /rest/cars
  app.get("/rest/:table", async (req, res) => {
    let query = "SELECT * FROM ??"
    let result = await db.query(query, [req.params.table])
    res.json(result)
  })

  // dynamisk route med id
  // ex: /rest/hotels_in_cities/2   |  SELECT * FROM hotels_in_cities WHERE id = 2
  app.get("/rest/:table/:id", async (req, res) => {
    let query = "SELECT * FROM ?? WHERE id = ?"
    let result = await db.query(query, [req.params.table])
    res.json(result)
  })

  // dynamisk post - SKA FUNKA SÅ HÄR, men ???
  app.post("/rest/:table", async (req, res) => {
    let query = "INSERT INTO ?? SET ?"
    let result = await db.query(query, req.body)
    console.log(query.sql)
    res.json(result)
  })
  */

  return db

}