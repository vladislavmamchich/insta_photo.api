const express = require('express')
const router = express.Router()

const {
	// getAllUsers,
	// getUsersFromPage,
	profileModeration,
	rotateImage,
	changeMainPhoto,
	deleteImage,
	getGeneralImagesFromPage,
	getUser
} = require('../controllers/users')

// router.get('/', getAllUsers)
// router.post('/from_page', getUsersFromPage)
router.patch('/moderate', profileModeration)
router.patch('/rotate_image', rotateImage)
router.patch('/change_main_photo', changeMainPhoto)
router.delete('/delete_image', deleteImage)
router.post('/images', getGeneralImagesFromPage)
router.get('/:_id', getUser)

module.exports = router
