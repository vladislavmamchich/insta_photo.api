const mongoose = require('mongoose')
const { Schema } = mongoose
const db = require('../connect')
const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(db)
const https = require('https')

const CitySchema = new Schema(
	{
		label: { type: String, unique: true, require: true },
		value: { type: String, unique: true, require: true },
		country: { type: Number, ref: 'Country', require: true }
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
		versionKey: false
	}
)

CitySchema.plugin(autoIncrement.plugin, 'City')

const City = db.model('City', CitySchema)

module.exports = City
