const jwt = require('jsonwebtoken')
const User = require('../db/models/User')
const {
	criptMd5,
	verifyPassword,
	isValidReferrer
} = require('../utils/helpers')
const { sendEmail } = require('../utils/email')
require('dotenv').config()
const { JWT_SECRET } = process.env

const register = async (req, res) => {
	try {
		const { email, username, password, referrer } = req.body
		const user = await User.findOne({
			$or: [{ username }, { email }]
		})
		if (!user) {
			let userFields = {
				email,
				username,
				password: criptMd5(password)
			}
			if (isValidReferrer(referrer)) {
				var referrerExist = await User.findOne({ ref_link: referrer })
			}
			if (referrerExist) {
				userFields.referrer = referrerExist._id
			}
			const newUser = await User.create(userFields)
			if (referrerExist) {
				referrerExist.referrals = [
					...referrerExist.referrals,
					newUser._id
				]
				await referrerExist.save()
			}
			await sendEmail(email)
			res.status(200).json({
				msg: 'Registration successfully'
			})
		} else {
			res.status(422).json({
				msg: 'User with this email or username is exist'
			})
		}
	} catch (err) {
		res.status(422).json(err)
	}
}

const login = async (req, res) => {
	try {
		const { username, password } = req.body
		const user = await User.findOne({
			username
		})
		if (user) {
			if (
				user.password.length > 0 &&
				password.length > 0 &&
				verifyPassword(password, user.password)
			) {
				const access_token = await jwt.sign(
					{
						_id: user._id,
						username: user.username
					},
					JWT_SECRET,
					{
						expiresIn: '365d'
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
				msg: 'User with this username not found'
			})
		}
	} catch (err) {
		res.status(422).json(err)
		throw err
	}
}

module.exports = {
	register,
	login
}
