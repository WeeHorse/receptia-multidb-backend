// välj SQL-version
const selectedSQL = ['sqlite','mysql','mssql'][0] // 0 = sqlite, 1 = mysql, 2 = mssql

// server port
let port = 3000

// express server
let express = require('express')
const app = express()

// bypass 2FA verification (dev only)
app.use(function(req,res,next){req.bypassVerification = false; next()})

// set limit for json request body
app.use(express.json({ limit: '100MB' }));

// serve frontend files (built)
app.use(express.static('./client'));

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
  saveUninitialized: true, // @todo läsa på
  cookie: { 
    secure: false, // @todo: Förklara, anpassa. Kryperad cookie, vi kan inte läsa klartextvärden. Inte heller se att en ens finns (på chrome 2021 i a f...)
    httpOnly: true // kan bara manageras på serversidan, kan inte kommas åt från javascript i klienten
  } // ändra till true för secure cookie (felsöka behövs här nu)
} ) )

// stripe
const Stripe = require('stripe')
const stripe = new Stripe('sk_test_NzHkwYglPCxxPr9NXGgBrhTy') // stripe.com api secret key

// ACL
const acl = require('./acl.js')
app.use(acl)

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

// Vonage 2FA 
const Vonage = require('@vonage/server-sdk');
const vonage = new Vonage({
  apiKey: "f713a6d9",
  apiSecret: "aSjPwz9cuuVwKNqS"
});

app.post('/rest/verify/request', async (request, response)=>{
  vonage.verify.request({
    number: request.body.number,
    brand: "Vonage"
  }, (err, result) => {
    if (err) {
      response.json({error: err})
    } else {
      request.session.verification = {
        request_id: result.request_id,
        phone_number: request.body.number,
        status: -1 // = har inte gjort en request
      }
      response.json({verification: 'pending', verifyRequestId: result.request_id})
    }
  });
})

app.post('/rest/verify/confirm', async (request, response)=>{
  vonage.verify.check({
    request_id: request.session?.verification?.request_id,
    code: request.body.code
  }, (err, result) => {
    if (err) {
      response.json({error: err})
    } else {
      if(result.status == 0){
        request.session.passwordAttempts = 0
      }
      request.session.verification.status = result.status
      response.json({verification: 'completed', status: result.status})
    }
  });
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