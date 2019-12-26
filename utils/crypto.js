const CryptoJS = require('crypto-js')
require('dotenv').config()
const key = process.env.REQUEST_KEY

const encrypt = (data) => {
    try {
        let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString()
        return ciphertext
    } catch (err) {
        throw err
    }
}

const decrypt = (data) => {
    try {
        let bytes = CryptoJS.AES.decrypt(data.toString(), key)
        let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
        return decryptedData
    } catch (err) {
        if (err instanceof SyntaxError) {
            return null
        } else {
            throw err.message
        }
    }
}

module.exports = { encrypt, decrypt }
