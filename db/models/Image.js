const mongoose = require('mongoose')
const { Schema } = mongoose
const db = require('../connect')
const autoIncrement = require('mongoose-auto-increment')
const mongoosePaginate = require('mongoose-paginate-v2')
autoIncrement.initialize(db)

const ImageSchema = new Schema(
    {
        originalname: { type: String, default: '' },
        encoding: { type: String, default: '' },
        mimetype: { type: String, default: '' },
        size: { type: String, default: '' },
        destination: { type: String, default: '' },
        filename: { type: String, default: '' },
        path: { type: String, default: '' },
        url: { type: String, default: '' },
        rotation: { type: Number, default: 0 }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        versionKey: false
    }
)

ImageSchema.plugin(autoIncrement.plugin, 'Image')
ImageSchema.plugin(mongoosePaginate)

const Image = db.model('Image', ImageSchema)

module.exports = Image
