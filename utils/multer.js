const multer = require('multer')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const cyrillicToTranslit = require('cyrillic-to-translit-js')
const { INVALID_EXTENSIONS, FILE_LIMITS } = require('../config/server')

const { JWT_SECRET } = process.env

const { createDir, secureRandom } = require('../utils/helpers')

const storage = multer.diskStorage({
	destination: async (req, file, cb) => {
		try {
			// const { _id } = await jwt.verify(req.token, JWT_SECRET)
			// const filePath = `./public/${_id}`
			const filePath = `./public/${
				new Date().toISOString().split('T')[0]
			}`
			if (!fs.existsSync(filePath)) {
				await createDir(filePath)
			}
			return cb(null, filePath)
		} catch (err) {
			cb(err)
		}
	},
	filename: (req, file, cb) => {
		let { originalname } = file
		let name = path.parse(originalname).name
		let ext = path.extname(originalname)
		cb(
			null,
			`${cyrillicToTranslit().transform(
				name,
				'_'
			)}_${new Date().getTime()}${ext}`
		)
	}
})

const fileFilter = async (req, file, cb) => {
	try {
		if (INVALID_EXTENSIONS.includes(path.extname(file.originalname))) {
			cb(null, false)
		} else {
			cb(null, true)
		}
	} catch (err) {
		cb(new Error("I don't have a clue!"))
	}
}

const upload = multer({
	storage,
	limits: FILE_LIMITS,
	fileFilter: (req, file, cb) => fileFilter(req, file, cb)
})

module.exports = { upload }
