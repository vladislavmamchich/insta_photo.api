const jwt = require('jsonwebtoken')
const {
    isValidEmail,
    isValidNickname,
    isValidPassword,
    isValidSecretWord
} = require('../utils/validator')
const { sha256Salt, getImageUrl, isNumeric } = require('../utils/helpers')
const User = require('../db/models/User')
const Captcha = require('../db/models/Captcha')
const Country = require('../db/models/Country')
const City = require('../db/models/City')

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
        const { files, body } = req
        body.data = JSON.parse(body.data)
        body.rotations = JSON.parse(body.rotations)
        const {
            with_email,
            email,
            nickname,
            allow_share_email,
            secret_word,
            password,
            repeat_password,
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
            age,
            captcha
        } = body.data
        const captchaExist = await Captcha.findOne({ ip, text: captcha })
        if (!captchaExist) {
            throw { msg: 'Invalid captcha' }
        }
        if (!files) {
            throw { msg: 'You must add at least one title picture' }
        }
        if (files.length > 5) {
            throw { msg: 'Maximum number of uploaded images - 5' }
        }
        if (with_email) {
            if (!isValidEmail(email)) {
                throw { msg: 'Invalid email' }
            }
            const isExist = await User.findOne({ email })
            if (isExist) {
                throw { msg: 'User with this email already exist' }
            }
            delete req.body.data.nickname
        } else {
            if (!isValidNickname(nickname)) {
                throw { msg: 'Invalid nickname' }
            }
            const isExist = await User.findOne({ nickname })
            if (isExist) {
                throw { msg: 'User with this nickname already exist' }
            }
            delete req.body.data.email
        }
        if (!isValidPassword(password)) {
            throw { msg: 'Invalid password' }
        }
        if (password !== repeat_password) {
            throw { msg: 'Passwords do not match' }
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
        if (!locality) {
            throw { msg: 'Invalid locality' }
        }
        const countryExist = await Country.findOne({
            value: country,
            label: country
        })
        const cityExist = await City.findOne({ value: region, label: region })
        const localityExist = await City.findOne({
            value: locality,
            label: locality
        })
        if (!countryExist) {
            console.log(1)
            let newCountry = await Country.create({
                value: country,
                label: country
            })
            if (region !== locality) {
                console.log(2)
                const newCities = await City.create([
                    { value: region, label: region, country: newCountry._id },
                    {
                        value: locality,
                        label: locality,
                        country: newCountry._id
                    }
                ])
                console.log(3)
                newCountry.cities = newCities.map(c => c._id)
                console.log(4)
            } else {
                const newCity = await City.create({
                    value: region,
                    label: region,
                    country: newCountry._id
                })
                newCountry.cities = [newCity._id]
            }
            console.log('newCountry', newCountry)
            await newCountry.save()
        } else {
            if (!cityExist) {
                const city = await City.create({
                    value: region,
                    label: region,
                    country: countryExist._id
                })
                await Country.updateOne(
                    { _id: countryExist._id },
                    { $push: { cities: city._id } }
                )
            }
            if (!localityExist) {
                const city = await City.create({
                    value: locality,
                    label: locality,
                    country: countryExist._id
                })
                await Country.updateOne(
                    { _id: countryExist._id },
                    { $push: { cities: city._id } }
                )
            }
        }
        const nationalityExist = await Country.findOne({
            value: nationality,
            label: nationality
        })
        if (!nationalityExist) {
            await Country.create({ value: nationality, label: nationality })
        }
        delete req.body.data.with_email
        delete req.body.data.repeat_password
        req.body.data.password = sha256Salt(password)
        const l = files.length
        for (let i = 0; i < l; i++) {
            req.files[i] = {
                ...files[i],
                rotation: body.rotations[i],
                url: getImageUrl(files[i].path),
                is_main: i === 0 ? true : false
            }
        }
        next()
    } catch (err) {
        res.status(422).json(err)
    }
}

module.exports = {
    loginMiddleware,
    registerMiddleware,
    resetPasswordMiddleware
}
