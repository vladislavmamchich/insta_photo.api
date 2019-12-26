const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const helmet = require('helmet')

const { notFound, verifyToken, middlewareOptions } = require('./middleware')
const { myLogger } = require('./utils/helpers')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')

const app = express()

app.use(helmet())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
	res.append('Access-Control-Allow-Origin', ['*'])
	res.append(
		'Access-Control-Allow-Methods',
		'GET, POST, PATCH, PUT, DELETE, OPTIONS'
	)
	res.append('Access-Control-Allow-Headers', [
		'Origin',
		'Content-Type, Authorization',
		'X-Auth-Token'
	])
	next()
})

app.options('/*', (req, res, next) => {
	res.sendStatus(200)
})
app.disable('etag')

app.use(myLogger)

app.use('/', indexRouter)

app.use(verifyToken)

app.use('/users', usersRouter)

module.exports = app
