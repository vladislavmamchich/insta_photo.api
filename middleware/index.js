const jwt = require('jsonwebtoken')
const { JWT_ERRORS } = require('../config/server')
let { JWT_SECRET } = process.env
const { isValidPassword } = require('../utils/validator')
const { isNumeric } = require('../utils/helpers')

const verifyToken = async (req, res, next) => {
    try {
        const bearerHeader = req.headers['authorization']
        if (bearerHeader) {
            const bearer = bearerHeader.split(' ')
            const bearerToken = bearer[1]
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

const checkData = ({ data, checkPassword = true }) => {
    try {
        const {
            password,
            repeat_password,
            country,
            region,
            height,
            weight,
            chest,
            waist,
            thighs,
            operations,
            nationality,
            age
        } = data
        if (checkPassword) {
            if (!isValidPassword(password)) {
                throw { msg: 'Invalid password' }
            }
            if (password !== repeat_password) {
                throw { msg: 'Passwords do not match' }
            }
        }
        if (age < 16 || age > 90) {
            throw { msg: 'Invalid age' }
        }
        if (!height || !isNumeric(height)) {
            throw { msg: 'Invalid height' }
        }
        if (!weight || !isNumeric(weight)) {
            throw { msg: 'Invalid weight' }
        }
        if (!chest || !isNumeric(chest)) {
            throw { msg: 'Invalid chest' }
        }
        if (!waist || !isNumeric(waist)) {
            throw { msg: 'Invalid waist' }
        }
        if (!thighs || !isNumeric(thighs)) {
            throw { msg: 'Invalid thighs' }
        }
        if (!country) {
            throw { msg: 'Invalid country' }
        }
        if (!region) {
            throw { msg: 'Invalid region' }
        }
        if (!nationality) {
            throw { msg: 'Invalid nationality' }
        }
    } catch (err) {
        throw err
    }
}

module.exports = {
    verifyToken,
    checkData
}
