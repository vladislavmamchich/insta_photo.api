const jwt = require('jsonwebtoken')
const User = require('../db/models/User')
const Image = require('../db/models/Image')
const { getImageUrl, sha256Salt } = require('../utils/helpers')
const { rotate } = require('../utils/jimp')
require('dotenv').config()
const { JWT_SECRET } = process.env
const { IMAGES_PER_PAGE } = require('../config/server')

const getProfile = async (req, res) => {
	try {
		const { token } = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		const profile = await User.findById(_id)
		res.status(200).json({ profile })
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
		const profile = await User.findOne({ _id, favourites: image_id })
		let new_favourites = false
		if (profile) {
			await User.updateOne({ _id }, { $pull: { favourites: image_id } })
			await Image.updateOne(
				{ _id: image_id },
				{ $pull: { favourites: _id } }
			)
		} else {
			await User.updateOne(
				{ _id, favourites: { $ne: image_id } },
				{ $push: { favourites: image_id } }
			)
			await Image.updateOne(
				{ _id: image_id, favourites: { $ne: _id } },
				{ $push: { favourites: _id } }
			)
			new_favourites = await Image.findOne({ _id: image_id })
		}
		res.status(200).json({ msg: 'Success', new_favourites })
	} catch (err) {
		res.status(422).json(err)
	}
}
const loadImages = async (req, res) => {
	try {
		const { token, files } = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		if (files.length) {
			let img_ids = []
			for (const file of files) {
				const {
					originalname,
					encoding,
					mimetype,
					size,
					destination,
					filename,
					path
				} = file
				const imgExist = await Image.findOne({ filename })
				if (!imgExist) {
					const img = await Image.create({
						originalname,
						encoding,
						mimetype,
						size,
						destination,
						filename,
						path,
						url: getImageUrl(path)
					})
					img_ids.push(img._id)
				}
			}
			var updated = await User.updateOne(
				{ _id },
				{ $push: { images: { $each: img_ids } } }
			)
		}
		res.status(200).json({ files, updated })
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
const changeEmail = async (req, res) => {
	try {
		const {
			token,
			body: { email }
		} = req
		const { _id } = await jwt.verify(token, JWT_SECRET)
		await User.updateOne({ _id }, { $set: { email } })
		const profile = await User.findById(_id)
		res.status(200).json({ msg: 'Email updated successfully', profile })
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
		const users = await User.find({ moderated: true, is_active: true })
		const users_ids = users.map(u => u._id)
		const images = await Image.paginate(
			{
				user: { $in: users_ids },
				favourites: _id
			},
			{
				offset,
				// sort: '-created_at',
				limit: IMAGES_PER_PAGE,
				populate: ['user']
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
					role: 'participant',
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

module.exports = {
	getProfile,
	loadImages,
	favourites,
	changeNickname,
	changeEmail,
	changePassword,
	changeSecretWord,
	allowShareEmail,
	favouritesFromPage,
	activation,
	registerParticipant
}
