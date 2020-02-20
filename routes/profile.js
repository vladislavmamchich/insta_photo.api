const express = require('express')
const router = express.Router()

const {
	getProfile,
	loadImages,
	favourites,
	changeNickname,
	changeEmail,
	changePassword,
	changeSecretWord,
	allowShareEmail,
	favouritesFromPage,
	activation,
	registerParticipant
} = require('../controllers/profile')
const {
	nicknameChecks,
	emailChecks,
	passwordChecks,
	registerParticipantMiddleware
} = require('../middleware/profile')

const { upload } = require('../utils/multer')

router.get('/', getProfile)
router.post('/load_images', upload.array('images'), loadImages)
router.post('/favourites', favourites)
router.post('/favourites_from_page', favouritesFromPage)
router.patch('/nickname', nicknameChecks, changeNickname)
router.patch('/email', emailChecks, changeEmail)
router.patch('/secret_word', changeSecretWord)
router.patch('/allow_share_email', allowShareEmail)
router.patch('/password', passwordChecks, changePassword)
router.patch('/activation', activation)
router.post(
	'/register_participant',
	[upload.array('files'), registerParticipantMiddleware],
	registerParticipant
)

module.exports = router
