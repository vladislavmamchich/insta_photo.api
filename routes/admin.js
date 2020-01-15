const express = require('express')
const router = express.Router()

const { getUser } = require('../controllers/admin')

router.post('/user', getUser)

module.exports = router
