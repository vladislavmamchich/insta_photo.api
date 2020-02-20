const User = require('../db/models/User')

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

module.exports = { createObserver }
