const nodemailer = require('nodemailer')
require('dotenv').config()
const { EMAIL_USER, EMAIL_PASSWORD } = process.env

const sendEmail = async ({ email, subject = 'Activate account', text }) => {
	try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: EMAIL_USER,
				pass: EMAIL_PASSWORD
			}
		})
		const mailOptions = {
			from: 'InstaPhoto',
			subject
		}
		console.log(email, text)
		await transporter.sendMail({ ...mailOptions, to: email, text })
	} catch (err) {
		console.log(err)
		throw err
	}
}

module.exports = { sendEmail }
