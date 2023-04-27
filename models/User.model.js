const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    profile_pic: { type: String, default: '' },
    name: { type: String, default: '' },
    bio: { type: String, default: '' },
    phone: { type: Number, default: 0 },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})

const UserModel = mongoose.model('user', UserSchema);

module.exports = {
    UserModel
}