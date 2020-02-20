const mongoose = require('mongoose')
const { Schema } = mongoose
const db = require('../connect')
const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(db)
const https = require('https')

const CountrySchema = new Schema(
	{
		label: { type: String, unique: true, require: true },
		value: { type: String, unique: true, require: true },
		cities: [{ type: Number, ref: 'City' }]
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
		versionKey: false
	}
)

CountrySchema.pre('find', function() {
	this.populate('cities')
})

CountrySchema.plugin(autoIncrement.plugin, 'Country')

const Country = db.model('Country', CountrySchema)

module.exports = Country
