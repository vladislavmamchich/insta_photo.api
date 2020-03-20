const jwt = require('jsonwebtoken')
const User = require('../db/models/User')
const { JWT_SECRET } = process.env

const getUser = async (req, res) => {
	try {
		const {
			body: { user_id },
			token
		} = req
		await jwt.verify(token, JWT_SECRET)
		const user = await User.findOne({ _id: user_id }, { password: 0 })
		res.status(200).json({ user })
	} catch (err) {
		res.status(422).json(err)
	}
}
// const getAllUsers = async (req, res) => {
// 	try {
// 		const { token } = req

// 		const users = await User.find()
// 		res.status(200).json({
// 			users
// 		})
// 	} catch (err) {
// 		res.status(422).json(err)
// 	}
// }
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
module.exports = {
	getUser,
	getUsersFromPage
}
