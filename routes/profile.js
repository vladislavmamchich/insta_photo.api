const express = require('express')
const router = express.Router()
const {
	nicknameChecks,
	emailChecks,
	passwordChecks,
	registerParticipantMiddleware,
	uploadImagesMdwr
} = require('../middleware/profile')
const {
	getProfile,
	favourites,
	changeNickname,
	changePassword,
	changeSecretWord,
	allowShareEmail,
	favouritesFromPage,
	activation,
	registerParticipant,
	uploadImages,
	emailRequest,
	changeEmail
} = require('../controllers/profile')

const { upload } = require('../services/filesUploader')

router.get('/', getProfile)
router.post('/favourites', favourites)
router.post('/favourites_from_page', favouritesFromPage)
router.patch('/nickname', nicknameChecks, changeNickname)
router.patch('/secret_word', changeSecretWord)
router.patch('/allow_share_email', allowShareEmail)
router.patch('/password', passwordChecks, changePassword)
router.patch('/activation', activation)
router.post(
	'/register_participant',
	[upload.array('files'), registerParticipantMiddleware],
	registerParticipant
)
router.post(
	'/upload_images',
	[upload.array('files'), uploadImagesMdwr],
	uploadImages
)
router.post('/email', emailChecks, emailRequest)
router.patch('/update_email', changeEmail)

module.exports = router
