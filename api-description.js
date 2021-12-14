module.exports = [
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