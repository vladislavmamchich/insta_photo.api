const jwt = require('jsonwebtoken')
const Country = require('../db/models/Country')

require('dotenv').config()
const { JWT_SECRET } = process.env

const getCountries = async (req, res) => {
	try {
		const { token } = req
		await jwt.verify(token, JWT_SECRET)
		let countries = await Country.find()
		res.status(200).json({ countries })
	} catch (err) {
		res.status(422).json(err)
	}
}

module.exports = {
	getCountries
}
