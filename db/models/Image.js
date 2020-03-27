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
        rotation: { type: Number, default: 0 },
        user: { type: Number, ref: 'User' },
        likes: [{ type: Number, ref: 'User' }],
        total_likes: { type: Number, default: 0 },
        height: { type: Number },
        weight: { type: Number },
        chest: { type: Number },
        waist: { type: Number },
        thighs: { type: Number }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        versionKey: false
    }
)

// ImageSchema.post('findOne', function(doc) {
//     delete doc.height
//     delete doc.weight
//     delete doc.chest
//     delete doc.waist
//     delete doc.thighs
//     return doc
// })
// ImageSchema.post('find', function(result) {
//     for (let i = 0; i < result.length; i++) {
//         delete result[i].height
//         delete result[i].weight
//         delete result[i].chest
//         delete result[i].waist
//         delete result[i].thighs
//     }
//     console.log(123)
//     return result
// })

ImageSchema.plugin(autoIncrement.plugin, 'Image')
ImageSchema.plugin(mongoosePaginate)

const Image = db.model('Image', ImageSchema)

module.exports = Image
