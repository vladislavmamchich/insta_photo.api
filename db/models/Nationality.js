const mongoose = require('mongoose')
const { Schema } = mongoose
const db = require('../connect')
const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(db)

const NationalitySchema = new Schema(
	{
		geonameId: { type: Number, unique: true, require: true }
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
		versionKey: false
	}
)

NationalitySchema.plugin(autoIncrement.plugin, 'Nationality')

const Nationality = db.model('Nationality', NationalitySchema)

module.exports = Nationality
