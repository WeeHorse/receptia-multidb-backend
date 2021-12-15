// modul? om vi hade använt ES6-moduler hade det varit smidigt att ha crypto + getHash i en egen modul
const crypto = require("crypto")
const salt = "öoaheriaheithfd".toString('hex')
function getHash(password){ // utility att skapa kryperade lösenord
    let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString('hex')
    return hash
}
// end - modul?


module.exports = function(app){

  // mysqlite
  const sqlite = require('sqlite3')
  // öppnar och ansluter till databasen
  const db = new sqlite.Database('./database/receptia.db')
  // vi gör om metoderna all och run till promise-metoder så att vi kan använda async/await för att vänta på databasen
  const util = require('util')
  db.all = util.promisify(db.all)
  db.run = util.promisify(db.run)

  // REST routes (endpoints)

  app.get("/rest/foods", async (req, res) => {
    // console.log(req.session)
    // req.session.color = "blue"
    let query = "SELECT * FROM foods"
    let result = await db.all(query)
    res.json(result)
  })

  app.get("/rest/foods/:id", async (req, res) => {
    let query = "SELECT * FROM foods WHERE id = ?"
    let result = await db.all(query, [req.params.id])
    res.json(result[0])
  })

  app.post('/rest/cart-item', async (request, response) => {
    // check if user exists before writing
    if(!request.session.user){
      response.status(401) // unauthorised
      response.json({error:'not logged in'})
      return;
    }
    let cartItem = request.body
    let result = await db.all('INSERT INTO cart_items VALUES(?,?,?,?)', [null, cartItem.food, cartItem.amount, request.session.user.id])
    response.json(result)
  })

  app.get('/rest/cart', async (request, response) => {
    // check if user exists before writing
    if(!request.session.user){
      response.status(401) // unauthorised
      response.json({error:'not logged in'})
      return;
    }
    let cart = await db.all('SELECT * FROM cart WHERE user = ?', [request.session.user.id])
    response.json(cart)
  })

  app.delete('/rest/cart', async (request, response) => {
    // check if user exists before writing
    if(!request.session.user){
      response.status(401) // unauthorised
      response.json({error:'not logged in'})
      return;
    }
    let result = await db.all('DELETE * FROM cart_items WHERE user = ?', [request.session.user.id])
    response.json(result)
  })

  app.delete('/rest/cart-item/:id', async (request, response) => {
    // check if user exists before writing
    if(!request.session.user){
      response.status(401) // unauthorised
      response.json({error:'not logged in'})
      return;
    }
    let result = await db.all('DELETE FROM cart_items WHERE id = ? AND user = ?', [request.params.id, request.session.user.id])
    response.json(result)
  })

  // registrera en ny användare
  app.post('/rest/users', async (request, response) => {
    let user = request.body
    let encryptedPassword = getHash(user.password) // encrypted password
    let result
    try{
      result = await db.all('INSERT INTO users VALUES(?,?,?,?,?)', [null, user.email, encryptedPassword, user.first_name, user.last_name])
    }catch(e){
      console.error(e)
    }
    response.json(result)
  })

  // logga in
  app.post('/rest/login', async (request, response) => {
    let encryptedPassword = getHash(request.body.password)
    let user = await db.all('SELECT * FROM users WHERE email = ? AND password = ?', [request.body.email, encryptedPassword])

    user = user[0] // resultatet av min SELECT blir en array, vi är bara intresserade av första elementet (vårt user objekt)

    console.log('request.session.verification', request.session.verification)

    if(user && user.email && request.session?.verification?.status == 0 && request.session?.verification?.phone_number == user.phone){
      request.session.user = user
      user.loggedIn = true
      user.roles = ['user'] // mock (@todo skapa roles tabell i databasen och joina med users)
      response.json({loggedIn:true})
    }else if((user && user.email) && request.session?.verification?.status != 0){
      if(!request.session.verification || request.session?.verification?.status == -1){
        response.json({error: "You must verify your account using two-factor authentication"})
      }else{
        response.json({error: "Your two-factor authentication has failed", statusCode: request.session?.verification?.status})
      }
    }else{
      response.status(401) // unauthorized  https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
      response.json({loggedIn:false, message:"no matching user"})
    }
  })

  // autentisera (hämta inloggad användare på denna session - och kontrollera alltid med db)
  app.get('/rest/login', async (request, response) => {
    let user
    if(request.session.user){
      user = await db.all('SELECT * FROM users WHERE email = ? AND password = ?', [request.session.user.email, request.session.user.password])
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

  return db;

}
