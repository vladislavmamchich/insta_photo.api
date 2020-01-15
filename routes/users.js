const express = require('express')
const router = express.Router()

const {
	getAllUsers,
	getUsersFromPage,
	profileActivation,
	rotateImage,
	changeMainPhoto,
	deleteImage
} = require('../controllers/users')

router.get('/', getAllUsers)
router.post('/from_page', getUsersFromPage)
router.patch('/activation', profileActivation)
router.patch('/rotate_image', rotateImage)
router.patch('/change_main_photo', changeMainPhoto)
router.delete('/delete_image', deleteImage)

module.exports = router
