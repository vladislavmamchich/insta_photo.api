const express = require('express')
const router = express.Router()

const {
	loginMiddleware,
	registerMiddleware,
	resetPasswordMiddleware,
	emailRegisterMdwr
} = require('../middleware/auth')
const {
	subscribe,
	login,
	checkUniq,
	register,
	resetPassword,
	getCapcha,
	emailRegister,
	emailRegisterConfirm
} = require('../controllers/auth')

const { uploadTmp } = require('../services/filesUploader')

router.post('/subscribe', subscribe)
router.post('/login', loginMiddleware, login)
router.post('/check_uniq', checkUniq)
router.post('/register', registerMiddleware, register)
router.post('/reset_password', resetPasswordMiddleware, resetPassword)
router.get('/captcha', getCapcha)
router.post(
	'/email_register',
	[uploadTmp.array('files'), emailRegisterMdwr],
	emailRegister
)
router.post('/email_register_confirm', emailRegisterConfirm)

module.exports = router
