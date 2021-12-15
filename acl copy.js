/*
    Exempel på att koppla in den här ACL middlewaren:
    (app är express)

    const acl = require('./acl.js')
    app.use(acl)    

*/


module.exports = function(req, res, next){
    console.log('calling the middleware', new Date())

    // log av request-egenskaper och session user:
    console.log({
        'req.url': req.url,
        'req.method': req.method,
        'req.path': req.path,
        'req.query': req.query,
        'req.body': req.body,
        'req.header': req.rawHeaders,
        'req.session.user': req.session.user
    });
    
    // när vi har request-egenskaper och user-egenskaper kan vi skapa filter
    if(req.query.stop == 1){ // placeholder för våra filter
        res.status(403)
        res.json({error: "You don't have access"})
    }else{
        next() // det är ok, du får resursen
    }     
}