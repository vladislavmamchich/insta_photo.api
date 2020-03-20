const mongoose = require('mongoose')
const { Schema } = mongoose
const db = require('../connect')
const autoIncrement = require('mongoose-auto-increment')
const mongoosePaginate = require('mongoose-paginate-v2')
autoIncrement.initialize(db)

const FavouriteImageSchema = new Schema(
	{
		user: { type: Number, ref: 'User' },
		original: { type: Number, ref: 'Image' },
		test: { type: String, default: 'qwe' }
	},
	{
		timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
		versionKey: false
	}
)

FavouriteImageSchema.plugin(autoIncrement.plugin, 'FavouriteImage')
FavouriteImageSchema.plugin(mongoosePaginate)

const FavouriteImage = db.model('FavouriteImage', FavouriteImageSchema)

module.exports = FavouriteImage
