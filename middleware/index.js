const jwt = require('jsonwebtoken')
const { JWT_ERRORS } = require('../config/server')
require('dotenv').config()
let { JWT_SECRET } = process.env

const verifyToken = async (req, res, next) => {
    try {
        const bearerToken = req.headers['authorization']
        if (bearerToken) {
            await jwt.verify(bearerToken, JWT_SECRET)
            req.token = bearerToken
            next()
        } else {
            res.sendStatus(401)
        }
    } catch (err) {
        if (JWT_ERRORS.includes(err.name)) {
            res.sendStatus(401)
        } else {
            res.status(422).json(err)
        }
    }
}

module.exports = {
    verifyToken
}
