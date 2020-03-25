const User = require('../db/models/User')
const Country = require('../db/models/Country')
const Region = require('../db/models/Region')
const Nationality = require('../db/models/Nationality')

const { secureRandom, sha256Salt } = require('../utils/helpers')

const createObserver = async () => {
	try {
		const password = secureRandom(10)
		const user = await User.create({
			nickname: secureRandom(10),
			password: sha256Salt(password),
			one_time_password: password,
			role: 'observer',
			is_active: true,
			moderated: true
		})
		return { user, password }
	} catch (err) {
		throw err
	}
}
const getUser = async ({ _id, email }) => {
	try {
		const user = await User.findOne(
			{
				$or: [{ email }, { nickname: email }]
			},
			{ password: 0 }
		)
		return user
	} catch (err) {
		throw err
	}
}

const updateRegisterGeo = async ({ country, region, nationality }) => {
	try {
		const countryExist = await Country.findOne({
			geonameId: country
		})
		if (countryExist) {
			const regionExist = await Region.findOne({
				geonameId: region
			})
			if (!regionExist) {
				const newRegion = await Region.create({
					geonameId: region,
					country: countryExist._id
				})
				await Country.updateOne(
					{
						_id: countryExist._id,
						regions: { $ne: newRegion._id }
					},
					{ $push: { regions: newRegion._id } }
				)
			}
		} else {
			const newCountry = await Country.create({
				geonameId: country
			})
			const newRegion = await Region.create({
				geonameId: region,
				country: newCountry._id
			})
			await Country.updateOne(
				{
					_id: newCountry._id,
					regions: { $ne: newRegion._id }
				},
				{ $push: { regions: newRegion._id } }
			)
		}
		const nationalityExist = await Nationality.findOne({
			geonameId: nationality
		})
		if (!nationalityExist) {
			await Nationality.create({ geonameId: nationality })
		}
	} catch (err) {
		throw err
	}
}

module.exports = { createObserver, updateRegisterGeo }
