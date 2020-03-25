const jwt = require('jsonwebtoken')
const fs = require('fs')
const User = require('../db/models/User')
const Image = require('../db/models/Image')
const FavouriteImage = require('../db/models/FavouriteImage')
const { getImageUrl, sha256Salt, secureRandom } = require('../utils/helpers')
const { rotate } = require('../services/images')
const { JWT_SECRET, PUBLIC_URL } = process.env
const { IMAGES_PER_PAGE } = require('../config/server')
const { getAsyncFromRedis, redisClient } = require('../services/redis/client')
const { sendEmail } = require('../services/email')

const getProfile = async (req, res) => {
	try {
		const { token } = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		const profile = await User.findById(_id).lean()
		let totalLikes = await getAsyncFromRedis('totalLikes')
		totalLikes = JSON.parse(totalLikes)
		res.status(200).json({
			profile: {
				...profile,
				main_photo: {
					...profile.main_photo,
					totalLikes: totalLikes[_id]
				}
			}
		})
	} catch (err) {
		res.status(422).json(err)
	}
}
const favourites = async (req, res) => {
	try {
		const {
			token,
			body: { image_id }
		} = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		const img = await FavouriteImage.findOne({
			original: image_id,
			user: _id
		})
		if (img) {
			await FavouriteImage.deleteOne({ _id: img._id })
			await User.updateOne({ _id }, { $pull: { favourites: image_id } })
		} else {
			await FavouriteImage.create({
				original: image_id,
				user: _id
			})
			await User.updateOne({ _id }, { $push: { favourites: image_id } })
		}
		res.status(200).json({ msg: 'Success' })
	} catch (err) {
		res.status(422).json(err)
	}
}
const changeNickname = async (req, res) => {
	try {
		const {
			token,
			body: { nickname }
		} = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		await User.updateOne({ _id }, { $set: { nickname } })
		const profile = await User.findById(_id)
		res.status(200).json({ msg: 'Nickname updated successfully', profile })
	} catch (err) {
		res.status(422).json(err)
	}
}
const emailRequest = async (req, res) => {
	try {
		const {
			token,
			body: { email }
		} = req
		await jwt.verify(token, JWT_SECRET)
		let link = ''
		const tokenExist = await getAsyncFromRedis(email)
		if (tokenExist) {
			link = `${PUBLIC_URL}/profile/?emailToken=${tokenExist}`
		} else {
			const emailToken = secureRandom(16)
			redisClient.setex(email, 1000 * 60 * 30, emailToken)
			redisClient.setex(emailToken, 1000 * 60 * 30, email)
			link = `${PUBLIC_URL}/profile/?emailToken=${emailToken}`
		}
		await sendEmail({
			email,
			subject: 'Confirm email',
			text: `Сlick on the link to confirm: ${link}`
		})
		res.status(200).json({
			msg: 'Check your mail and confirm please'
		})
	} catch (err) {
		res.status(422).json(err)
	}
}

const changePassword = async (req, res) => {
	try {
		const {
			token,
			body: { new_password }
		} = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		await User.updateOne(
			{ _id },
			{
				$set: {
					password: sha256Salt(new_password),
					one_time_password: undefined
				}
			}
		)
		res.status(200).json({ msg: 'Password changed successfully' })
	} catch (err) {
		res.status(422).json(err)
	}
}
const changeSecretWord = async (req, res) => {
	try {
		const {
			token,
			body: { secret_word }
		} = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		await User.updateOne({ _id }, { $set: { secret_word } })
		const profile = await User.findById(_id)
		res.status(200).json({
			msg: 'Secret word changed successfully',
			profile
		})
	} catch (err) {
		res.status(422).json(err)
	}
}
const allowShareEmail = async (req, res) => {
	try {
		const {
			token,
			body: { allow_share_email }
		} = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		await User.updateOne({ _id }, { $set: { allow_share_email } })
		const profile = await User.findById(_id)
		res.status(200).json({ msg: 'Successfully', profile })
	} catch (err) {
		res.status(422).json(err)
	}
}
const favouritesFromPage = async (req, res) => {
	try {
		const {
			token,
			body: { page }
		} = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		const offset = (page - 1) * IMAGES_PER_PAGE
		const images = await FavouriteImage.paginate(
			{ user: _id },
			{
				offset,
				sort: '-created_at',
				limit: IMAGES_PER_PAGE,
				populate: ['original'],
				lean: true
			}
		)
		res.status(200).json({ images })
	} catch (err) {
		res.status(422).json(err)
	}
}
const activation = async (req, res) => {
	try {
		const {
			token,
			body: { is_active }
		} = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		await User.updateOne({ _id }, { $set: { is_active } })
		res.status(200).json({ msg: 'Success' })
	} catch (err) {
		res.status(422).json(err)
	}
}
const registerParticipant = async (req, res) => {
	try {
		const {
			token,
			body: { data },
			files
		} = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		console.log(files, data)
		let images = []
		for (const image of files) {
			const newImg = await Image.create(image)
			images.push(newImg._id)
			if (image.rotation !== 0) {
				await rotate(image)
			}
		}
		await User.updateOne(
			{ _id },
			{
				$set: {
					...data,
					images,
					main_photo: images[0],
					moderated: false,
					ex_observer: true
				}
			}
		)
		await Image.updateMany(
			{ _id: { $in: images } },
			{ $set: { user: _id } }
		)
		const profile = await User.findById(_id)
		res.status(200).json({ msg: 'Success', profile })
	} catch (err) {
		res.status(422).json(err)
	}
}
const uploadImages = async (req, res) => {
	try {
		const { files, token } = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		console.log(files, _id)
		let images = []
		for (const image of files) {
			const newImg = await Image.create({ ...image, user: _id })
			images.push(newImg._id)
			if (image.rotation !== 0) {
				await rotate(image)
			}
		}
		await User.updateOne(
			{ _id },
			{ $set: { images, main_photo: images[0] } }
		)
		res.status(200).json({
			msg: 'Registration successfully'
		})
	} catch (err) {
		res.status(422).json(err)
	}
}

const changeEmail = async (req, res) => {
	try {
		const {
			token,
			body: { emailToken }
		} = req
		console.log(emailToken)
		const { _id } = await jwt.verify(token, JWT_SECRET)
		const email = await getAsyncFromRedis(emailToken)
		if (email) {
			await User.updateOne({ _id }, { $set: { email } })
			const profile = await User.findById(_id)
			res.status(200).json({ msg: 'Email updated successfully', profile })
			redisClient.del(emailToken)
			redisClient.del(email)
		} else {
			res.status(422).json({ msg: 'Token expired or invalid' })
		}
	} catch (err) {
		res.status(422).json(err)
	}
}

module.exports = {
	getProfile,
	favourites,
	changeNickname,
	changePassword,
	changeSecretWord,
	allowShareEmail,
	favouritesFromPage,
	activation,
	registerParticipant,
	uploadImages,
	emailRequest,
	changeEmail
}
