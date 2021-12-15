/*
    Exempel på att koppla in den här ACL middlewaren:
    (app är express)

    const acl = require('./acl.js')
    app.use(acl)    

*/

const accessList = require('./access-list.json')

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
        'req.session.user': req.session.user,
        'accessList': accessList
    });

    let roles = (req.session && req.session.user)? req.session.user.roles : ['anonymous','*']

    let found = false
    for(let access of accessList){
        if(req.path.match(new RegExp(access.path))){
            for(role of access.roles){
                if(roles.includes(role.role)){
                    found = true
                    break
                }                
            }                        
        }
    }
    
    // när vi har request-egenskaper och user-egenskaper kan vi skapa filter
    if(!found){ // placeholder för våra filter
        res.status(403)
        res.json({error: "You don't have access"})
    }else{
        next() // det är ok, du får resursen
    }     
}