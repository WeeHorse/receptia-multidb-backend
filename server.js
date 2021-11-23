// pick SQL version
const selectedSQL = ['sqlite','mysql','mssql'][0] // 0 = sqlite, 1 = mysql, 2 = mssql

let express = require('express')
const app = express()

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

const apiDescription = [
    {
      route:"/rest",
      methods: ["GET"],
      description:"This route: The API documentation"
    },
    {
      route:"/rest/foods",
      methods: ["GET"],
      description:"List available foods"
    },
    {
      route:"/rest/cart",
      methods: ["GET","DELETE"],
      description:"List or delete the user's cart content"
    },
    {
      route:"/rest/cart-item",
      methods: ["POST"],
      description:"Add an item to the card"
    },
    {
      route:"/rest/cart-item/:id",
      methods: ["DELETE"],
      description:"Delete a specific item from the card"
    },
    {
      route:"/rest/users",
      methods: ["POST"],
      description:"Create a user"
    },
    {
      route:"/rest/login",
      methods: ["POST","GET","DELETE"],
      description:"Login user, get current logged in user, logout"
    },
    {
      route:"/rest/pay",
      methods: ["POST"],
      description:"Make a payment"
    }
  ]

// database specific REST ROUTES
const db = require("./server-" + selectedSQL + ".js")(app);

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


// start av webbservern
app.listen(3000, async () => {
    if(db.connect){ // connect to db server if there is one (sqlite does not use one)
        await db.connect()
    }
    console.log('http://localhost:3000/rest/')
    console.log('server running on port 3000')
})