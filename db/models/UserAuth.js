const mongoose = require('mongoose')
const { Schema } = mongoose
const db = require('../connect')
const autoIncrement = require('mongoose-auto-increment')
const { isValidEmail, isValidPhoneNumber } = require('../../utils/validator')

autoIncrement.initialize(db)

const UserAuthSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
            lowercase: true,
            default: '',
            validate: isValidEmail
        },
        password: { type: String },
        secret_word: { type: String, default: '' }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        versionKey: false
    }
)

UserAuthSchema.statics = {
    isExistPhone(phone_number) {
        return this.findOne({ phone_number: phone_number })
    }
}

UserAuthSchema.plugin(autoIncrement.plugin, 'UserAuth')

const UserAuth = db.model('UserAuth', UserAuthSchema, 'userauth')

module.exports = UserAuth
