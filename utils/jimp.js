const Jimp = require('jimp')

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

module.exports = { rotate, rotateClockwise }
