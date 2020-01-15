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
        share_email: { type: Boolean, default: false },
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
        chest: { type: Number },
        waist: { type: Number },
        thighs: { type: Number },
        operations: { type: Boolean, default: false },
        allow_share_email: { type: Boolean, default: false },
        nationality: { type: String },
        country: { type: String },
        state: { type: String },
        region: { type: String },
        locality: { type: String },
        password: { type: String },
        one_time_password: { type: String },
        images: [{ type: Number, ref: 'Image' }],
        main_photo: { type: Number, ref: 'Image' }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        versionKey: false
    }
)

// UserSchema.statics = {
// isExist(id) {
//     return this.findById(id)
// },
// async getSenderInfo(_id) {
//     return await this.findOne(
//         { _id: _id },
//         { first_name: 1, last_name: 1, image: 1 }
//     )
// },
// async getUserName(_id, full = false) {
//     console.log('getUserName', _id)
//     let {
//         first_name,
//         last_name,
//         middle_name,
//         phone_number
//     } = await this.findOne({ _id })
//     const full_name = full
//         ? `${last_name} ${first_name} ${middle_name}`
//         : `${first_name} ${last_name}`
//     const res = full_name.length > 4 ? full_name : phone_number
//     return res
// },
// async getCompanyUsers(company_id, user_id) {
//     let users = await User.find({
//         _id: { $ne: user_id },
//         companies: company_id
//     })
//         .populate('contacts')
//         .populate('tasks')
//         .populate('created_tasks')
//         .populate('position')
//         .populate('role')
//         .populate('departments')
//     return users
// },
// async getAdminAccess(_id) {
//     const { role, position } = await this.findOne({ _id })
//         .populate('role')
//         .populate('position')
//     if (role) {
//         return role.admin_access
//     }
//     if (position) {
//         return position.admin_access
//     }
// }
// }

UserSchema.pre('findOne', function() {
    this.populate('images')
})
UserSchema.pre('find', function() {
    this.populate('images')
})
UserSchema.post('find', function(doc) {
    doc.password = undefined
    return doc
})

UserSchema.plugin(autoIncrement.plugin, 'User')
UserSchema.plugin(mongoosePaginate)

const User = db.model('User', UserSchema)

module.exports = User
