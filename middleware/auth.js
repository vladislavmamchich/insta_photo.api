const jwt = require('jsonwebtoken')
const {
    isValidEmail,
    isValidNickname,
    isValidPassword,
    isValidSecretWord
} = require('../utils/validator')
const { sha256Salt, getImageUrl, isNumeric } = require('../utils/helpers')
const { updateRegisterGeo } = require('../controllers/db')
const User = require('../db/models/User')
const Captcha = require('../db/models/Captcha')
const { checkData } = require('./')
const { bull } = require('../services/queues/bull')

const loginMiddleware = async (req, res, next) => {
    try {
        const ip =
            (req.headers['x-forwarded-for'] || '').split(',').pop() ||
            req.connection.remoteAddress
        const { email, password, captcha } = req.body
        const captchaExist = await Captcha.findOne({ ip, text: captcha })
        if (!captchaExist) {
            throw { msg: 'Invalid captcha' }
        }
        if (!isValidNickname(email)) {
            throw { msg: 'Invalid nickname' }
        }
        if (!isValidPassword(password)) {
            throw { msg: 'Invalid password' }
        }
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}
const resetPasswordMiddleware = async (req, res, next) => {
    try {
        const ip =
            (req.headers['x-forwarded-for'] || '').split(',').pop() ||
            req.connection.remoteAddress
        const { email, secret_word, captcha } = req.body
        const captchaExist = await Captcha.findOne({ ip, text: captcha })
        if (!captchaExist) {
            throw { msg: 'Invalid captcha' }
        }
        if (!isValidEmail(email)) {
            throw { msg: 'Invalid email' }
        }
        const user = await User.findOne({ email })
        if (!user) {
            throw { msg: 'Email not found' }
        }
        if (!isValidSecretWord(secret_word)) {
            throw { msg: 'Invalid secret_word' }
        }
        if (user.secret_word !== secret_word) {
            throw { msg: 'Invalid secret_word' }
        }
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}

const registerMiddleware = async (req, res, next) => {
    try {
        const ip =
            (req.headers['x-forwarded-for'] || '').split(',').pop() ||
            req.connection.remoteAddress
        const { data } = req.body
        const { nickname, captcha, password } = data
        const captchaExist = await Captcha.findOne({ ip, text: captcha })
        if (!captchaExist) {
            throw { msg: 'Invalid captcha' }
        }
        if (!isValidNickname(nickname)) {
            throw { msg: 'Invalid nickname' }
        }
        console.log(123)
        const isExist = await User.findOne({ nickname })
        if (isExist) {
            throw { msg: 'User with this nickname already exist' }
        }
        console.log(123)
        checkData({ data })
        await updateRegisterGeo(data)
        delete req.body.data.repeat_password
        req.body.data.password = sha256Salt(password)
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}
const emailRegisterMdwr = async (req, res, next) => {
    try {
        const ip =
            (req.headers['x-forwarded-for'] || '').split(',').pop() ||
            req.connection.remoteAddress
        let { body, files } = req
        body.data = JSON.parse(body.data)
        body.rotations = JSON.parse(body.rotations)
        const { email, captcha, password } = body.data
        const captchaExist = await Captcha.findOne({ ip, text: captcha })
        if (!captchaExist) {
            throw { msg: 'Invalid captcha' }
        }
        if (!isValidEmail(email)) {
            throw { msg: 'Invalid email' }
        }
        const isExist = await User.findOne({ email })
        if (isExist) {
            throw { msg: 'User with this email already exist' }
        }
        checkData({ data: body.data })
        if (!files) {
            throw { msg: 'You must add at least one main picture' }
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
            }
        }
        bull.add('compressImages', { files })
        delete req.body.data.repeat_password
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}

module.exports = {
    loginMiddleware,
    registerMiddleware,
    resetPasswordMiddleware,
    emailRegisterMdwr
}
