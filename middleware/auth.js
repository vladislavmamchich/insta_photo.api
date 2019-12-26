const jwt = require('jsonwebtoken')
const {
    isValidEmail,
    isValidName,
    isValidPassword
} = require('../utils/helpers')

const loginMiddleware = async (req, res, next) => {
    try {
        const { username, password } = req.body
        if (!isValidName(username)) {
            throw { msg: 'Invalid username' }
        }
        if (!isValidPassword(password)) {
            throw { msg: 'Invalid password' }
        }
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}

const registerMiddleware = async (req, res, next) => {
    try {
        const { email, username, password } = req.body
        if (!isValidEmail(email)) {
            throw { msg: 'Invalid email' }
        }
        if (!isValidName(username)) {
            throw { msg: 'Invalid username' }
        }
        if (!isValidPassword(password)) {
            throw { msg: 'Invalid password' }
        }
        // if (!isValidReferrer(referrer)) {
        //     throw { msg: 'Invalid referrer' }
        // }
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}

module.exports = {
    loginMiddleware,
    registerMiddleware
}
