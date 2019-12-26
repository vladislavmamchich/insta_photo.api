const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.set('useFindAndModify', false)
require('dotenv').config()
const options = {
	useNewUrlParser: true,
	// reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
	// reconnectInterval: 500, // Reconnect every 500ms
	poolSize: 2, // Maintain up to 10 socket connections
	bufferMaxEntries: 0,
	useCreateIndex: true,
	useUnifiedTopology: true
}
const { DB_HOST, DB_PORT, DB_USEDB, DB_USER, DB_PASS } = process.env

mongoose.connect(
	`mongodb://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_USEDB}`,
	options
)
const db = mongoose.connection

db.on('error', function(err) {
	console.log(`Error connecting to DB ${DB_USEDB}`)
})
db.once('open', function callback() {
	console.log(`Connecting to DB ${DB_USEDB}... Ok`)
})

process.on('SIGINT', function() {
	mongoose.connection.close(function() {
		console.log(
			'Mongoose default connection disconnected through app termination'
		)
		process.exit(0)
	})
})

module.exports = db
