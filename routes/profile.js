const express = require('express')
const router = express.Router()

const { getProfile, loadImages } = require('../controllers/profile')

const { upload } = require('../utils/multer')

router.get('/', getProfile)
router.post('/load_images', upload.array('images'), loadImages)

module.exports = router
