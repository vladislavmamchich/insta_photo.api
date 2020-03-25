const jwt = require('jsonwebtoken')
const fs = require('fs')
const User = require('../db/models/User')
const Image = require('../db/models/Image')
const Country = require('../db/models/Country')
const FavouriteImage = require('../db/models/FavouriteImage')
const { rotateClockwise } = require('../services/images')
const { sendEmail } = require('../services/email')
const { JWT_SECRET } = process.env
const { IMAGES_PER_PAGE } = require('../config/server')
const { getAsyncFromRedis } = require('../services/redis/client')

// const getAllUsers = async (req, res) => {
//     try {
//         const { token } = req
//         const { _id } = await jwt.verify(token, JWT_SECRET)
//         const users = await User.find()
//         res.status(200).json({
//             users
//         })
//     } catch (err) {
//         res.status(422).json(err)
//     }
// }
// const getUsersFromPage = async (req, res) => {
//     try {
//         const {
//             token,
//             body: { page, limit }
//         } = req
//         console.log('token', token)
//         await jwt.verify(token, JWT_SECRET)
//         const users = await User.paginate({}, { page, limit })
//         res.status(200).json(users)
//     } catch (err) {
//         res.status(422).json(err)
//     }
// }
const profileModeration = async (req, res) => {
    try {
        const {
            token,
            body: { user_id, moderated }
        } = req
        const { _id } = await jwt.verify(token, JWT_SECRET)
        const { email, ex_observer, role } = await User.findById(user_id)
        if (moderated && ex_observer && role === 'observer') {
            await User.updateOne(
                { _id: user_id },
                { $set: { moderated, role: 'participant', is_active: true } }
            )
        } else {
            await User.updateOne(
                { _id: user_id },
                { $set: { moderated, is_active: true } }
            )
        }
        if (moderated && email) {
            sendEmail({ email, text: `Your account moderated:)` })
        }
        res.status(200).json({ msg: 'Success' })
        req.app.get('update_admin_users')({
            admin: _id
        })
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
        const { images, main_photo } = await User.findOne({ _id: user_id })
        if (main_photo === image_id) {
            res.status(422).json({ msg: 'Нельзя удалить главное фото' })
        } else {
            await User.updateOne(
                { _id: user_id },
                { $pull: { images: image_id } }
            )
            res.status(200).json({ msg: 'Deleted successfully' })
            const { path } = await Image.findById(image_id)
            try {
                fs.unlinkSync(path)
                await Image.deleteOne({ _id: image_id })
                await FavouriteImage.deleteMany({ original: image_id })
            } catch (err) {
                throw err
            }
        }
    } catch (err) {
        res.status(422).json(err)
    }
}
const getGeneralImagesFromPage = async (req, res) => {
    try {
        const {
            token,
            body: { page, favourites, country, region, nationality, age }
        } = req
        const { _id } = await jwt.verify(token, JWT_SECRET)
        let query = {
            country: country || undefined,
            region: region || undefined,
            nationality: nationality || undefined,
            age: age || undefined
        }
        query = JSON.parse(JSON.stringify(query))
        let image_ids = await User.find({
            moderated: true,
            is_active: true,
            ...query
        }).distinct('main_photo')
        if (favourites) {
            const ids = await User.findOne({
                _id
            }).distinct('favourites')
            image_ids = image_ids.filter(id => ids.includes(id))
        }
        const offset = (page - 1) * IMAGES_PER_PAGE
        const images = await Image.paginate(
            {
                _id: { $in: image_ids },
                user: { $ne: _id }
            },
            {
                offset,
                sort: '-created_at',
                limit: IMAGES_PER_PAGE,
                populate: ['user'],
                lean: true
            }
        )
        let totalLikes = await getAsyncFromRedis('totalLikes')
        totalLikes = JSON.parse(totalLikes)
        res.status(200).json({ images, totalLikes })
    } catch (err) {
        console.log('err', err)
        res.status(422).json(err)
    }
}
const likeImage = async ({ user_id, image_id }) => {
    try {
        const image = await Image.findOne({ _id: image_id })
        if (user_id !== image.user) {
            let totalLikes = await getAsyncFromRedis('totalLikes')
            totalLikes = JSON.parse(totalLikes)
            if (image.likes.includes(user_id)) {
                await Image.updateOne(
                    { _id: image_id },
                    { $pull: { likes: user_id } }
                )
            } else {
                await Image.updateOne(
                    { _id: image_id },
                    { $push: { likes: user_id } }
                )
            }
            const images = await Image.find({ user: image.user })
            totalLikes[image.user] = images.reduce(
                (sum, cur) => sum + cur.likes.length,
                0
            )
            return { likedUser: image.user, totalLikes }
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
    // getAllUsers,
    // getUsersFromPage,
    profileModeration,
    rotateImage,
    changeMainPhoto,
    deleteImage,
    getGeneralImagesFromPage,
    likeImage,
    getUser
}
