const jwt = require('jsonwebtoken')
const Country = require('../db/models/Country')
const Nationality = require('../db/models/Nationality')
const { JWT_SECRET } = process.env

const getAll = async (req, res) => {
	try {
		const { token } = req
		await jwt.verify(token, JWT_SECRET)
		const countries = await Country.find().populate('regions')
		const countriesGeonamesIds = await Country.find().distinct('geonameId')
		const nationalitiesGeonamesIds = await Nationality.find().distinct(
			'geonameId'
		)
		let countriesObj = {}
		for (const country of countries) {
			countriesObj[country.geonameId] = country.regions.map(
				r => r.geonameId
			)
		}
		res.status(200).json({
			countriesObj,
			countriesGeonamesIds,
			nationalitiesGeonamesIds
		})
	} catch (err) {
		res.status(422).json(err)
	}
}

module.exports = {
	getAll
}
