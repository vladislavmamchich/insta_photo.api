const mongoose = require('mongoose')
const { Schema } = mongoose
const db = require('../connect')
const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(db)
const https = require('https')

const RegionSchema = new Schema(
	{
		label: { type: String, unique: true, require: true },
		value: { type: String, unique: true, require: true },
		country: { type: Number, ref: 'Country', require: true },
		cities: [{ type: Number, ref: 'City' }]
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
		versionKey: false
	}
)

RegionSchema.plugin(autoIncrement.plugin, 'Region')

const Region = db.model('Region', RegionSchema)

module.exports = Region
