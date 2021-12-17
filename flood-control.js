/*
// flood control middleware
const floodControl = require('./flood-control.js')
app.use(floodControl)
*/


const ipTable = {
    // "192.168.50.144":   {
    //     attempts: [1639743126615]
    // }
}

const permanentBans = [] // borde ligga i en fil eller i en databas

module.exports = function(req, res, next){

    // capture ip
    // ::ffff:192.168.50.144
    let ip = req.ip.split(':').pop()
    console.log(ip)

    // stoppa direkt vid permanent band
    if(permanentBans.includes(ip)){
        return // låt klienten hänga ovetandes :)
    }

    // om det inte finns ett entry med ip-numret, så skapar vi det
    if(!ipTable[ip]){
        ipTable[ip] = {attempts:[]}
    }
    // lägg till denna anslutning i vår entry (för det ip-nummer som ansluter)
    ipTable[ip].attempts.push(new Date().getTime())
    console.log(ipTable)

    // filter malicous ip:s    
    if(ipTable[ip].attempts.length > 0){
        let sum = 0;
        for(let i=1; i<ipTable[ip].attempts.length; i++){
            let attempt = ipTable[ip].attempts[i]
            let prevAttempt = ipTable[ip].attempts[i-1]
            sum += attempt-prevAttempt
        }
        let freq = sum/ipTable[ip].attempts.length
        console.log(freq)        
        // desto större antal attempts ett ip har gjort, desto kortare frekvens kan jag banna baserat på
        if(ipTable[ip].attempts.length > 50 && freq < 1000){
            // när vi bara avslutar vår middleware utan att svara så blir klienten hängande. Det vill vi:)
            return // temporary ban ett för frekvent ip-nummer (dynamisk ban, frekvensen sjunker om klienten väntar)
        }
        if(ipTable[ip].attempts.length > 500 && freq < 1500){
            // short term permanent ban?
            permanentBans.push(ip)
        }
        if(ipTable[ip].attempts.length > 5000 && freq < (1000 * 60 * 60)){
            // long term permanent ban?
            permanentBans.push(ip)
        }
    }    

    next() // skicka vidare till servern
}