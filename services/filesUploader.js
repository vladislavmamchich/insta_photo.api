const multer = require('multer')
const path = require('path')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { INVALID_EXTENSIONS, FILE_LIMITS } = require('../config/server')
const { JWT_SECRET } = process.env
const { createDir } = require('../utils/helpers')

const generateFilename = (req, file, cb) => {
	const { originalname } = file
	const ext = path.extname(originalname)
	cb(null, `${crypto.randomBytes(16).toString('hex')}${ext}`)
}
const storage = multer.diskStorage({
	destination: async (req, file, cb) => {
		try {
			const { _id } = await jwt.verify(req.token, JWT_SECRET)
			const filePath = `./public/${
				new Date().toISOString().split('T')[0]
			}/${_id}`
			await createDir(filePath)
			return cb(null, filePath)
		} catch (err) {
			cb(err)
		}
	},
	filename: (req, file, cb) => generateFilename(req, file, cb)
})
const tmpStorage = multer.diskStorage({
	destination: async (req, file, cb) => {
		try {
			const filePath = `./public/${
				new Date().toISOString().split('T')[0]
			}/tmp`
			await createDir(filePath)
			return cb(null, filePath)
		} catch (err) {
			cb(err)
		}
	},
	filename: (req, file, cb) => generateFilename(req, file, cb)
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
const uploadTmp = multer({
	storage: tmpStorage,
	limits: FILE_LIMITS,
	fileFilter: (req, file, cb) => fileFilter(req, file, cb)
})

module.exports = { upload, uploadTmp }
