const jwt = require('jsonwebtoken')
const User = require('../db/models/User')

require('dotenv').config()
const { JWT_SECRET } = process.env

const getUser = async (req, res) => {
	try {
		const {
			body: { user_id },
			token
		} = req
		const user = await User.findOne({ _id: user_id }, { password: 0 })
		res.status(200).json({ user })
	} catch (err) {
		res.status(422).json(err)
	}
}

module.exports = {
	getUser
}
