const multer = require('multer')
const fs = require('fs')
const path = require('path')
const jwt = require('jsonwebtoken')
const cyrillicToTranslit = require('cyrillic-to-translit-js')

const { SECRET } = process.env

const { createDir } = require('../utils/helpers')

const invalidExtensions = ['.exe', '.dmg', '.bat', '.js', '.sh']
const limits = {
	fieldSize: 1000 * 1024 * 1024, // Максимальный размер значения поля
	fieldNameSize: 100, // Максимальный размер имени файла
	fields: 9, // Максимальное количество не-файловых полей
	fileSize: 1000 * 1024 * 1024, // Максимальный размер файла в байтах для multipart-форм
	files: 1, // Максимальное количество полей с файлами для multipart-форм
	parts: 10, // Максимальное количество полей с файлами для multipart-форм (поля плюс файлы)
	headerPairs: 2000 // Максимальное количество пар ключ-значение key=>value для multipart-форм, которое обрабатывается
}

const storage = multer.diskStorage({
	destination: async (req, file, cb) => {
		try {
			let { _id } = await jwt.verify(req.token, SECRET)
			let filePath = `./public/files/${_id}`
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
		cb(null, `${cyrillicToTranslit().transform(name, '_')}${ext}`)
	}
})

const fileFilter = async (req, file, cb) => {
	try {
		if (invalidExtensions.includes(path.extname(file.originalname))) {
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
	limits: limits,
	fileFilter: (req, file, cb) => fileFilter(req, file, cb)
})

module.exports = { upload }
