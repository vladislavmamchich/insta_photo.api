const { compressImage } = require('../images')

module.exports = async function(job) {
	try {
		console.log('job', job)
		const { files } = job.data
		if (files instanceof Array) {
			for (const file of files) {
				compressImage(file.path)
			}
		} else {
			compressImage(files.path)
		}
	} catch (err) {
		console.log(err)
	}
}
