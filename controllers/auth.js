const jwt = require('jsonwebtoken')
const svgCaptcha = require('svg-captcha')
const User = require('../db/models/User')
const Image = require('../db/models/Image')
const Captcha = require('../db/models/Captcha')
const { verifyPassword, sha256Salt, secureRandom } = require('../utils/helpers')
const { rotate } = require('../utils/jimp')
const { sendEmail } = require('../utils/email')
require('dotenv').config()
const { JWT_SECRET } = process.env

const { createObserver } = require('./db')

const subscribe = async (req, res) => {
	try {
		const { user, password } = await createObserver()
		const access_token = await jwt.sign(
			{
				_id: user._id
			},
			JWT_SECRET,
			{
				expiresIn: '24h'
			}
		)
		res.status(200).json({
			msg: 'Subscribe successfull',
			data: user,
			access_token,
			password
		})
	} catch (err) {
		res.status(422).json(err)
	}
}
const getCapcha = async (req, res) => {
	try {
		const ip =
			(req.headers['x-forwarded-for'] || '').split(',').pop() ||
			req.connection.remoteAddress
		const { data, text } = svgCaptcha.create({ background: '#fff' })
		const captcha = await Captcha.findOne({ ip })
		if (captcha) {
			await Captcha.updateOne({ ip }, { $set: { text } })
		} else {
			await Captcha.create({ ip, text })
		}
		res.status(200).json({ data })
	} catch (err) {
		res.status(422).json(err)
	}
}
const checkUniq = async (req, res) => {
	try {
		const { email, nickname } = req.body
		if (!email && !nickname) {
			res.status(200).json({ uniq: false })
		} else {
			let uniq = true
			if (email) {
				const user = await User.findOne({ email })
				if (user) uniq = false
			} else if (nickname) {
				const user = await User.findOne({ nickname })
				if (user) uniq = false
			}
			res.status(200).json({ uniq })
		}
	} catch (err) {
		res.status(422).json(err)
	}
}
const register = async (req, res) => {
	try {
		const {
			files,
			body: { data }
		} = req
		console.log(files, data)
		let images = []
		for (const image of files) {
			const newImg = await Image.create(image)
			images.push(newImg._id)
			if (image.rotation !== 0) {
				await rotate(image)
			}
		}
		await User.create({
			...data,
			images,
			main_photo: images[0],
			role: 'participant'
		})
		res.status(200).json({
			msg: 'Registration successfully'
		})
	} catch (err) {
		res.status(422).json(err)
	}
}
const resetPassword = async (req, res) => {
	try {
		const {
			files,
			body: { email, secret_word }
		} = req
		const password = secureRandom(10)
		await User.updateOne(
			{ email },
			{ $set: { password: sha256Salt(password) } }
		)
		await sendEmail({ email, text: `Your new password ${password}` })
		res.status(200).json({
			msg: 'Registration successfully'
		})
	} catch (err) {
		res.status(422).json(err)
	}
}
const login = async (req, res) => {
	try {
		const { email, password, remember_me } = req.body
		const user = await User.findOne({
			$or: [{ email }, { nickname: email }]
		})
		if (user) {
			if (user.moderated) {
				if (
					user.password.length > 0 &&
					password.length > 0 &&
					verifyPassword(password, user.password)
				) {
					const access_token = await jwt.sign(
						{
							_id: user._id
						},
						JWT_SECRET,
						{
							expiresIn: remember_me ? '48h' : '24h'
						}
					)
					res.status(200).json({
						msg: 'Login successfull',
						data: user,
						access_token
					})
				} else {
					res.status(422).json({
						msg: 'Wrong password'
					})
				}
			} else {
				res.status(422).json({
					msg: 'Your account has not moderated'
				})
			}
		} else {
			res.status(422).json({
				msg: 'User with this email/nickname not found'
			})
		}
		// res.json({ user })
	} catch (err) {
		res.status(422).json(err)
		throw err
	}
}

module.exports = {
	subscribe,
	login,
	checkUniq,
	register,
	resetPassword,
	getCapcha
}
