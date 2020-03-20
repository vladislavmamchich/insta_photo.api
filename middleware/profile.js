const jwt = require('jsonwebtoken')
const { verifyPassword, getImageUrl, isNumeric } = require('../utils/helpers')
const { isValidNickname, isValidEmail } = require('../utils/validator')
const User = require('../db/models/User')
const Country = require('../db/models/Country')
const City = require('../db/models/City')
const Nationality = require('../db/models/Nationality')
const Region = require('../db/models/Region')
const { JWT_SECRET } = process.env
const { checkData } = require('./')
const { updateRegisterGeo } = require('../controllers/db')
const { bull } = require('../services/queues/bull')

const nicknameChecks = async (req, res, next) => {
    try {
        const { nickname } = req.body
        if (!isValidNickname(nickname)) {
            throw { msg: 'Invalid nickname' }
        }
        const user = await User.findOne({ nickname })
        if (user) {
            throw { msg: 'Nickname is already in use' }
        }
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}
const emailChecks = async (req, res, next) => {
    try {
        const { email } = req.body
        if (!isValidEmail(email)) {
            throw { msg: 'Invalid email' }
        }
        const user = await User.findOne({ email })
        if (user) {
            throw { msg: 'Email is already in use' }
        }
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}
const passwordChecks = async (req, res, next) => {
    try {
        const { body, token } = req
        const { old_password, new_password, repeat_password } = body
        const { _id } = await jwt.verify(token, JWT_SECRET)
        const user = await User.findOne({ _id })
        if (!verifyPassword(old_password, user.password)) {
            throw { msg: 'Wrong old password' }
        }
        if (new_password !== repeat_password) {
            throw { msg: 'New passwords do not match' }
        }
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}
const registerParticipantMiddleware = async (req, res, next) => {
    try {
        const { files, body } = req
        body.data = JSON.parse(body.data)
        body.rotations = JSON.parse(body.rotations)
        const {
            country,
            region,
            locality,
            height,
            weight,
            chest,
            waist,
            thighs,
            operations,
            nationality,
            age
        } = body.data
        if (!files) {
            throw { msg: 'You must add at least one title picture' }
        }
        if (files.length > 5) {
            throw { msg: 'Maximum number of uploaded images - 5' }
        }
        checkData({ data: body.data, checkPassword: false })
        await updateRegisterGeo({ country, region, locality, nationality })
        const l = files.length
        for (let i = 0; i < l; i++) {
            req.files[i] = {
                ...files[i],
                rotation: body.rotations[i],
                url: getImageUrl(files[i].path)
                // is_main: i === 0 ? true : false
            }
        }
        bull.add('compressImages', { files })
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}

const uploadImagesMdwr = async (req, res, next) => {
    try {
        const { files, body } = req
        body.rotations = JSON.parse(body.rotations)
        if (!files) {
            throw { msg: 'You must add at least one title picture' }
        }
        if (files.length > 5) {
            throw { msg: 'Maximum number of uploaded images - 5' }
        }
        const l = files.length
        for (let i = 0; i < l; i++) {
            req.files[i] = {
                ...files[i],
                rotation: body.rotations[i],
                url: getImageUrl(files[i].path)
                // is_main: i === 0 ? true : false
            }
        }
        bull.add('compressImages', { files })
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}

module.exports = {
    nicknameChecks,
    emailChecks,
    passwordChecks,
    registerParticipantMiddleware,
    uploadImagesMdwr
}
