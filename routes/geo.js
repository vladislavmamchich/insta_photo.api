const express = require('express')
const router = express.Router()

const { getAll } = require('../controllers/geo')

router.get('/', getAll)

module.exports = router
