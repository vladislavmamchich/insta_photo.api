const jwt = require('jsonwebtoken')
const User = require('../db/models/User')
const Image = require('../db/models/Image')
const { getImageUrl } = require('../utils/helpers')
require('dotenv').config()
const { JWT_SECRET } = process.env

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

module.exports = {
	getProfile,
	loadImages
}
