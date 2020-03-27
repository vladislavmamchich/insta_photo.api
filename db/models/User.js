const mongoose = require('mongoose')
const { Schema } = mongoose
const db = require('../connect')
const autoIncrement = require('mongoose-auto-increment')
const mongoosePaginate = require('mongoose-paginate-v2')
const { isValidEmail } = require('../../utils/validator')
autoIncrement.initialize(db)
require('./Image')

const UserSchema = new Schema(
    {
        email: {
            type: String,
            lowercase: true,
            default: '',
            validate: isValidEmail
        },
        nickname: { type: String, default: '' },
        secret_word: { type: String, default: '' },
        is_active: { type: Boolean, default: true },
        moderated: { type: Boolean, default: false },
        ex_observer: { type: Boolean, default: false },
        role: {
            type: String,
            enum: ['observer', 'participant'],
            default: 'observer'
        },
        sex: { type: String, enum: ['male', 'female'], default: 'female' },
        age: { type: Number },
        height: { type: Number },
        weight: { type: Number },
        height_unit: { type: String, enum: ['cm', 'inch'], default: 'cm' },
        weight_unit: { type: String, enum: ['kg', 'lb'], default: 'kg' },
        chest: { type: Number },
        waist: { type: Number },
        thighs: { type: Number },
        operations: { type: Boolean, default: false },
        allow_share_email: { type: Boolean, default: false },
        nationality: { type: String, default: '' },
        country: { type: String, default: '' },
        region: { type: String, default: '' },
        password: { type: String },
        one_time_password: { type: String },
        images: [{ type: Number, ref: 'Image' }],
        favourites: [{ type: Number, ref: 'Image' }],
        main_photo: { type: Number, ref: 'Image' },
        is_admin: { type: Boolean }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        versionKey: false
    }
)

UserSchema.pre('findOne', function() {
    this.populate('images').populate('main_photo')
})
UserSchema.pre('find', function() {
    this.populate('images').populate('main_photo')
})
UserSchema.post('findOne', function(doc) {
    if (doc) {
        delete doc.password
        return doc
    }
})
UserSchema.post('find', function(result) {
    for (let i = 0; i < result.length; i++) {
        delete result[i].password
    }
    return result
})

UserSchema.plugin(autoIncrement.plugin, 'User')
UserSchema.plugin(mongoosePaginate)

const User = db.model('User', UserSchema)

module.exports = User
