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
        favourites: [{ type: Number, ref: 'User' }],
        is_main: { type: Boolean, default: false }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        versionKey: false,
        toObject: {
            virtuals: true
        },
        toJSON: {
            virtuals: true
        }
    }
)

ImageSchema.plugin(autoIncrement.plugin, 'Image')
ImageSchema.plugin(mongoosePaginate)

// ImageSchema.virtual('totalLikes').get(function() {
//     return this.likes.length
// })
// ImageSchema.virtual('totalLikes_2', {
//     ref: 'Image',
//     localField: 'likes',
//     foreignField: 'assigned',
//     count: true
// })

// ImageSchema.pre('save', async function() {
//     console.log(this.user)
//     const q = await this.aggregate()
//         .match({ user: this.user })
//         .unwind('$likes')
//         .count()
//     //     const q = Image.aggregate([
//     //         { $match: { user: this.user } },
//     //         { $unwind: '$likes' }
//     //     ]).count()
//     console.log(q)
// })

const Image = db.model('Image', ImageSchema)

// ;(async () => {
//     const q = await Image.aggregate([
//         { $unwind: '$likes' },
//         {
//             $lookup: {
//                 from: 'likes', // <-- collection to join
//                 localField: 'likes',
//                 foreignField: '_id',
//                 as: 'likes_joined'
//             }
//         }
//     ])
//     console.log(q)
// })()

module.exports = Image
