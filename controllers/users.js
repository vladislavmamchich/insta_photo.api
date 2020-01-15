const jwt = require('jsonwebtoken')
const fs = require('fs')
const User = require('../db/models/User')
const Image = require('../db/models/Image')
const { rotateClockwise } = require('../utils/jimp')
const { sendEmail } = require('../utils/email')
require('dotenv').config()
const { JWT_SECRET } = process.env

const getAllUsers = async (req, res) => {
    try {
        const { token } = req
        const { _id } = await jwt.verify(token, JWT_SECRET)
        const users = await User.find()
        res.status(200).json({
            users
        })
    } catch (err) {
        res.status(422).json(err)
    }
}
const getUsersFromPage = async (req, res) => {
    try {
        const {
            token,
            body: { page, limit }
        } = req
        console.log('token', token)
        // const { _id } = await jwt.verify(token, JWT_SECRET)
        const users = await User.paginate({}, { page, limit })
        res.status(200).json(users)
    } catch (err) {
        res.status(422).json(err)
    }
}
const profileActivation = async (req, res) => {
    try {
        const {
            token,
            body: { user_id, is_active }
        } = req
        const { email } = await User.findById(user_id)
        await User.updateOne(
            { _id: user_id },
            { $set: { is_active, moderated: true } }
        )
        if (is_active && email) {
            sendEmail({ email, text: `Your account activated` })
        }
        res.status(200).json(result)
    } catch (err) {
        res.status(422).json(err)
    }
}
const rotateImage = async (req, res) => {
    try {
        const {
            token,
            body: { image, rotation }
        } = req
        await rotateClockwise(image)
        await Image.updateOne({ _id: image._id }, { $set: { rotation } })
        res.status(200).json({ msg: 'Image rotated successfully' })
    } catch (err) {
        res.status(422).json(err)
    }
}
const changeMainPhoto = async (req, res) => {
    try {
        const {
            token,
            body: { user_id, main_photo }
        } = req
        await User.updateOne({ _id: user_id }, { $set: { main_photo } })
        res.status(200).json({ msg: 'Saved successfully' })
    } catch (err) {
        res.status(422).json(err)
    }
}
const deleteImage = async (req, res) => {
    try {
        const {
            token,
            body: { user_id, image_id }
        } = req
        let { images, main_photo } = await User.findOne({ _id: user_id })
        if (main_photo === image_id) {
            main_photo = undefined
        }
        await User.updateOne(
            { _id: user_id },
            { $pull: { images: image_id }, $set: { main_photo } }
        )
        res.status(200).json({ msg: 'Deleted successfully' })
        const { path } = await Image.findById(image_id)
        try {
            fs.unlinkSync(path)
            await Image.deleteOne({ _id: image_id })
        } catch (err) {
            throw err
        }
    } catch (err) {
        res.status(422).json(err)
    }
}

module.exports = {
    getAllUsers,
    getUsersFromPage,
    profileActivation,
    rotateImage,
    changeMainPhoto,
    deleteImage
}
