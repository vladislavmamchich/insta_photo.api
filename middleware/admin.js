const jwt = require('jsonwebtoken')
const { verifyPassword, getImageUrl, isNumeric } = require('../utils/helpers')
const { isValidNickname, isValidEmail } = require('../utils/validator')
const User = require('../db/models/User')
const Country = require('../db/models/Country')
const City = require('../db/models/City')
const { JWT_SECRET } = process.env
const validator = require('validator')

const adminMdwr = async (req, res, next) => {
    try {
        const { token } = req
        const { _id } = await jwt.verify(token, JWT_SECRET)
        const user = await User.findById(_id)
        if (!user.is_admin) {
            res.sendStatus(403)
        }
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}

const getUserMdwr = async (req, res, next) => {
    try {
        const { user_id } = req.body
        if (!validator.isInt(user_id)) {
            throw { msg: 'Invalid user id' }
        }
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}

module.exports = {
    adminMdwr,
    getUserMdwr
}
