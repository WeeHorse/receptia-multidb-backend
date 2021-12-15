// välj SQL-version
const selectedSQL = ['sqlite','mysql','mssql'][0] // 0 = sqlite, 1 = mysql, 2 = mssql

// server port
let port = 3000

// express server
let express = require('express')
const app = express()

// set limit for json request body
app.use(express.json({ limit: '100MB' }));



// läser in modulen body-parser
const bodyParser = require('body-parser')
// registrerar den som middleware
app.use( bodyParser.json() )

// läser in modulen...
let cookieParser = require('cookie-parser')
// registrerar den som middleware
app.use(cookieParser())

// läser in module...
let session = require('express-session')
// registrerar den som middleware
app.use( session( {
  secret: 'keyboard cat jksfj<khsdka',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // ändra till true för secure cookie (felsöka behövs här nu)
} ) )

// stripe
const Stripe = require('stripe')
const stripe = new Stripe('sk_test_NzHkwYglPCxxPr9NXGgBrhTy') // stripe.com api secret key

// ACL
const acl = require('./acl.js')
app.use(acl)

// serve frontend files (built)
app.use(express.static('./client'));

// database specific REST ROUTES
const db = require("./server-" + selectedSQL + ".js")(app);

// REST api desciption
const apiDescription = require('./api-description.js');
const res = require('express/lib/response');

// common REST ROUTES

app.get("/rest", async (req, res) => {
    res.json(apiDescription)
})

app.post('/rest/pay', async (request, response) => {
  // check if user exists before paying
  // if(!request.session.user){
  //   response.status(401) // unauthorised
  //   response.json({error:'not logged in'})
  //   return;
  // }
  // let email = request.session.user.email
  let email = 'tester@test.tst'

  // PAY WITH STRIPE
  // create / access a stripe customer
  let customer = await stripe.customers.create({
    email: email,
  });

  // set payment method
  let source = await stripe.customers.createSource(customer.id, {
    source: 'tok_visa'
  });

  // charge payment
  let charge = await stripe.charges.create({
    amount: request.body.sumToCharge * 100, // SEK ören
    currency: 'SEK',
    customer: source.customer
  });

  response.json({customer, source, charge})

})

// wildcard 404
app.all('/*', async (request, response) => {
  response.status(404)
  response.json({ error: 'No such route.' });
})


// start av webbservern
app.listen(port, async () => {
    if(db.connect){ // connect to db server if there is one (sqlite does not use one)
        await db.connect()
    }
    console.log(`http://localhost:${port}/rest/`)
    console.log('server running on port ' + port)
})