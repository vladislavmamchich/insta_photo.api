const express = require('express')
const router = express.Router()

const { adminMdwr, getUserMdwr } = require('../middleware/admin')

const { getUser, getUsersFromPage } = require('../controllers/admin')

router.use(adminMdwr)

router.post('/users', getUsersFromPage)
router.post('/user', getUserMdwr, getUser)

module.exports = router
