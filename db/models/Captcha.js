const mongoose = require('mongoose')
const { Schema } = mongoose
const db = require('../connect')
const autoIncrement = require('mongoose-auto-increment')
autoIncrement.initialize(db)

const CaptchaSchema = new Schema(
    {
        ip: { type: String, unique: true, require: true },
        text: { type: String, require: true }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        versionKey: false
    }
)

CaptchaSchema.plugin(autoIncrement.plugin, 'Captcha')

const Captcha = db.model('Captcha', CaptchaSchema)

module.exports = Captcha
