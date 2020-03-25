const jwt = require('jsonwebtoken')
const fs = require('fs')
const svgCaptcha = require('svg-captcha')
const User = require('../db/models/User')
const Image = require('../db/models/Image')
const Captcha = require('../db/models/Captcha')
const {
	verifyPassword,
	sha256Salt,
	secureRandom,
	createDir
} = require('../utils/helpers')
const { sendEmail } = require('../services/email')
const { JWT_SECRET, PUBLIC_URL } = process.env
const { getAsyncFromRedis, redisClient } = require('../services/redis/client')
const { createObserver, updateRegisterGeo } = require('./db')
const { rotate } = require('../services/images')
const { bull } = require('../services/queues/bull')

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
		const { email, nickname, with_email } = req.body
		if (!email && !nickname) {
			res.status(200).json({ uniq: false })
		} else {
			let uniq = true
			if (with_email && email) {
				const user = await User.findOne({ email })
				if (user) uniq = false
			} else if (!with_email && nickname) {
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
			body: { data }
		} = req
		const { _id } = await User.create({
			...data,
			role: 'participant'
		})
		const access_token = await jwt.sign({ _id }, JWT_SECRET, {
			expiresIn: '24h'
		})
		res.status(200).json({
			access_token
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
		await sendEmail({ email, text: `Your new password ${password}` })
		await User.updateOne(
			{ email },
			{ $set: { password: sha256Salt(password) } }
		)
		res.status(200).json({
			msg: 'Password reseted successfully'
		})
	} catch (err) {
		res.status(422).json(err)
	}
}
const login = async (req, res) => {
	try {
		const { email, password } = req.body
		const user = await User.findOne({
			$or: [{ email }, { nickname: email }]
		})
		if (user) {
			if (user.role === 'participant' && !user.moderated) {
				res.status(422).json({
					msg: 'Your account has not moderated'
				})
			} else {
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
							expiresIn: '24h'
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
			}
		} else {
			res.status(422).json({
				msg: 'User with this email/nickname not found'
			})
		}
	} catch (err) {
		res.status(422).json(err)
		throw err
	}
}
const emailRegister = async (req, res) => {
	try {
		const {
			files,
			body: { data }
		} = req
		const tokenExist = await getAsyncFromRedis(data.email)
		let link = ''
		if (tokenExist) {
			redisClient.setex(
				tokenExist,
				1000 * 60 * 30,
				JSON.stringify({ data, files })
			)
			link = `${PUBLIC_URL}/login/?emailRegisterToken=${tokenExist}`
		} else {
			const emailRegisterToken = secureRandom(16)
			redisClient.setex(data.email, 1000 * 60 * 30, emailRegisterToken)
			redisClient.setex(
				emailRegisterToken,
				1000 * 60 * 30,
				JSON.stringify({ data, files })
			)
			link = `${PUBLIC_URL}/login/?emailRegisterToken=${emailRegisterToken}`
		}
		await sendEmail({
			email: data.email,
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
const emailRegisterConfirm = async (req, res) => {
	try {
		const {
			body: { emailRegisterToken }
		} = req
		let userData = await getAsyncFromRedis(emailRegisterToken)
		if (userData) {
			const { data, files } = JSON.parse(userData)
			const { _id } = await User.create({
				...data,
				password: sha256Salt(data.password),
				role: 'participant'
			})
			let images = []
			for (const image of files) {
				const destination = `${image.destination.slice(
					0,
					image.destination.lastIndexOf('/')
				)}/${_id}`
				const path = `${destination.slice(2)}/${image.filename}`
				bull.add('compressImages', { files: { path } })
				const url = path.slice(path.indexOf('/'))
				await createDir(destination)
				await fs.renameSync(image.path, path)
				const newImg = await Image.create({
					...image,
					user: _id,
					destination,
					path,
					url
				})
				images.push(newImg._id)
				if (image.rotation !== 0) {
					await rotate(image)
				}
			}
			await User.updateOne(
				{ _id },
				{ $set: { images, main_photo: images[0] } }
			)
			await updateRegisterGeo({ ...data })
			res.status(200).json({
				msg: 'Email confirmed',
				email: data.email,
				password: data.password
			})
			redisClient.del(data.email)
			redisClient.del(emailRegisterToken)
		} else {
			res.status(422).json({ msg: 'Token expired or invalid' })
		}
	} catch (err) {
		res.status(422).json(err)
	}
}
module.exports = {
	subscribe,
	login,
	checkUniq,
	register,
	resetPassword,
	getCapcha,
	emailRegister,
	emailRegisterConfirm
}
