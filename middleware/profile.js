const jwt = require('jsonwebtoken')
const { verifyPassword, getImageUrl, isNumeric } = require('../utils/helpers')
const { isValidNickname, isValidEmail } = require('../utils/validator')
const User = require('../db/models/User')
const Country = require('../db/models/Country')
const City = require('../db/models/City')
require('dotenv').config()
const { JWT_SECRET } = process.env

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
    nicknameChecks,
    emailChecks,
    passwordChecks,
    registerParticipantMiddleware
}
