const crypto = require("crypto")
const salt = "paraplane".toString('hex')

module.exports = {
   getHash(password){ // utility
        let hash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`)
        return hash
   }
}