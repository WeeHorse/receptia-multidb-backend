const accessList = require('./access-list.json')

module.exports = function(req, res, next){
    
    // "deep exists"
    let roles = req.session?.user?.roles || ['anonymous'] 
    roles.push('*') // always add any match (wildcard)
    
    console.log({
        'req.path': req.path,
        'req.method': req.method,
        'req.body': req.body,
        'req.session.user': req.session.user,
        'roles': roles,
        'accessList': accessList
    })

    let found = false

    for(access of accessList){
        if(req.path.match(new RegExp(access.path))){ // @todo undersöka strikt matchning
            for(role of access.roles){
                if(roles.includes(role.role)){
                    // @todo ackumulera rättiheter (kanske har flera roller, hitta bästa/högsta rättigheterna)
                    if(role.methods.includes(req.method)){ // @todo case independent match?
                        found = true
                    }                    
                }
            }            
        }
    }

    if(found){
        next()
    }else{
        res.status(403) // @todo skriva logik för att ge "rätt" felmeddelande, som 401 eller 403 beroende på om jag är inloggad eller inte
        res.json({error: "You don't have access"})
    }    
}