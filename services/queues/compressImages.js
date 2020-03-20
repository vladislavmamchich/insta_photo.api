const { compressImage } = require('../images')

module.exports = async function(job) {
	try {
		console.log('job', job)
		const { files } = job.data
		for (const file of files) {
			compressImage(file.path)
		}
	} catch (err) {
		console.log(err)
	}
}
