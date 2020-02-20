const jwt = require('jsonwebtoken')
const fs = require('fs')
const User = require('../db/models/User')
const Image = require('../db/models/Image')
const Country = require('../db/models/Country')
const { rotateClockwise } = require('../utils/jimp')
const { sendEmail } = require('../utils/email')
require('dotenv').config()
const { JWT_SECRET } = process.env
const { IMAGES_PER_PAGE } = require('../config/server')

const redis = require('redis')
const client = redis.createClient(6379)
const { promisify } = require('util')
const getAsync = promisify(client.get).bind(client)

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
        await jwt.verify(token, JWT_SECRET)
        const users = await User.paginate({}, { page, limit })
        res.status(200).json(users)
    } catch (err) {
        res.status(422).json(err)
    }
}
const profileModeration = async (req, res) => {
    try {
        const {
            token,
            body: { user_id, moderated }
        } = req
        await jwt.verify(token, JWT_SECRET)
        const { email } = await User.findById(user_id)
        await User.updateOne({ _id: user_id }, { $set: { moderated } })
        if (moderated && email) {
            sendEmail({ email, text: `Your account moterated` })
        }
        res.status(200).json({ msg: 'Success' })
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
        await jwt.verify(token, JWT_SECRET)
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
        await jwt.verify(token, JWT_SECRET)
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
        await jwt.verify(token, JWT_SECRET)
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
const getGeneralImagesFromPage = async (req, res) => {
    try {
        const {
            token,
            body: { page }
        } = req
        const { _id } = await jwt.verify(token, JWT_SECRET)
        const offset = (page - 1) * IMAGES_PER_PAGE
        const users = await User.find({ moderated: true, is_active: true })
        const users_ids = users.map(u => u._id)
        const images = await Image.paginate(
            {
                is_main: true,
                $and: [{ user: { $ne: _id } }, { user: { $in: users_ids } }]
            },
            {
                offset,
                sort: '-created_at',
                limit: IMAGES_PER_PAGE,
                populate: ['user'],
                lean: true
            }
        )
        let totalLikes = await getAsync('totalLikes')
        totalLikes = JSON.parse(totalLikes)
        images.docs = images.docs.map(img => {
            return {
                ...img,
                totalLikes: totalLikes[img.user._id]
            }
        })
        res.status(200).json({ images })
    } catch (err) {
        console.log('err', err)
        res.status(422).json(err)
    }
}
const likeImage = async ({ user_id, image_id }) => {
    try {
        let image = await Image.findOne({ _id: image_id })
        if (user_id !== image.user) {
            if (image.likes.includes(user_id)) {
                image.likes = image.likes.filter(id => id !== user_id)
                // await Image.updateMany(
                //     { user: user_id },
                //     {
                //         $set: {
                //             global_likes_count: image.global_likes_count - 1
                //         }
                //     },
                //     { multi: true }
                // )
            } else {
                image.likes = [...image.likes, user_id]
                // await Image.updateMany(
                //     { user: user_id },
                //     {
                //         $set: {
                //             global_likes_count: image.global_likes_count + 1
                //         }
                //     },
                //     { multi: true }
                // )
            }
            await image.save()
            return { likedUser: image.user }
        } else {
            throw { msg: 'error' }
        }
    } catch (err) {
        throw err
    }
}
const getUser = async (req, res) => {
    try {
        const {
            params: { _id },
            token
        } = req
        await jwt.verify(token, JWT_SECRET)
        const user = await User.findOne({ _id }, { password: 0 })
        res.status(200).json({ user })
    } catch (err) {
        res.status(422).json(err)
    }
}

module.exports = {
    getAllUsers,
    getUsersFromPage,
    profileModeration,
    rotateImage,
    changeMainPhoto,
    deleteImage,
    getGeneralImagesFromPage,
    likeImage,
    getUser
}
