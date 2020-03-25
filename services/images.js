const Jimp = require('jimp')
const fs = require('fs')
const piexif = require('piexifjs')
const path = require('path')
const imagemin = require('imagemin')
const imageminPngquant = require('imagemin-pngquant')
const TYPE = `binary`

const imageminConfig = destination => ({
	destination,
	plugins: [
		imageminPngquant({
			quality: [0.6, 0.8]
		})
	]
})
const rotate = async image => {
	try {
		const rotation =
			image.rotation === 90
				? 270
				: image.rotation === 270
				? 90
				: image.rotation
		const img = await Jimp.read(image.path)
		img.rotate(rotation).write(image.path)
	} catch (err) {
		console.log(err)
	}
}
const rotateClockwise = async image => {
	try {
		const img = await Jimp.read(image.path)
		img.rotate(270).write(image.path)
	} catch (err) {
		console.log(err)
	}
}
const decreaseQualityJpg = async filepath => {
	try {
		const img = await Jimp.read(filepath)
		img.quality(90).write(filepath)
	} catch (err) {
		throw err
	}
}
const decreaseQualityPng = async filepath => {
	try {
		await imagemin(
			[filepath],
			imageminConfig(filepath.slice(0, filepath.lastIndexOf('/')))
		)
	} catch (err) {
		throw err
	}
}
const removeExif = filepath => {
	try {
		const newData = piexif.remove(fs.readFileSync(filepath).toString(TYPE))
		fs.writeFileSync(filepath, new Buffer.from(newData, TYPE))
	} catch (err) {
		throw err
	}
}
const compressImage = filepath => {
	try {
		console.log('compressImage', filepath)
		const ext = path.extname(filepath)
		if (ext === '.png') {
			decreaseQualityPng(filepath)
		} else {
			decreaseQualityJpg(filepath)
			removeExif(filepath)
		}
	} catch (err) {
		throw err
	}
}

module.exports = { rotate, rotateClockwise, compressImage }
