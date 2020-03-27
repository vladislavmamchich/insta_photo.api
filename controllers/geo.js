const jwt = require('jsonwebtoken')
const Country = require('../db/models/Country')
const Nationality = require('../db/models/Nationality')
const { JWT_SECRET } = process.env

const getAll = async (req, res) => {
	try {
		const { token } = req
		await jwt.verify(token, JWT_SECRET)
		const countries = await Country.find()
		const nationalities = await Nationality.find()
		res.status(200).json({
			countries,
			nationalities
		})
	} catch (err) {
		res.status(422).json(err)
	}
}

module.exports = {
	getAll
}
