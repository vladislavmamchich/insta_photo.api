const express = require('express')
const router = express.Router()

const {
	loginMiddleware,
	registerMiddleware,
	resetPasswordMiddleware
} = require('../middleware/auth')
const {
	subscribe,
	login,
	checkUniq,
	register,
	resetPassword,
	getCapcha
} = require('../controllers/auth')

const { upload } = require('../utils/multer')

router.post('/subscribe', subscribe)
router.post('/login', loginMiddleware, login)
router.post('/check_uniq', checkUniq)
router.post('/register', [upload.array('files'), registerMiddleware], register)
router.post('/reset_password', resetPasswordMiddleware, resetPassword)
router.get('/captcha', getCapcha)

module.exports = router
