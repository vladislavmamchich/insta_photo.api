const express = require('express')
const router = express.Router()

const { getCountries } = require('../controllers/countries')

router.get('/', getCountries)

module.exports = router
