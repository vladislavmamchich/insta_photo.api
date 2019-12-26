const nodemailer = require('nodemailer')
require('dotenv').config()
const { EMAIL_USER, EMAIL_PASSWORD } = process.env

const sendEmail = async (email, link) => {
	try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: EMAIL_USER,
				pass: EMAIL_PASSWORD
			}
		})
		const mailOptions = {
			from: 'Universe',
			subject: 'Restore password'
		}
		let text = 'Для восстановления пароля перейдите по ссылке: ' + link
		console.log(email, text)
		await transporter.sendMail({ ...mailOptions, to: email, text })
	} catch (err) {
		console.log(err)
	}
}

module.exports = { sendEmail }
