const mongoose = require('mongoose');



const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    fullName: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true }
    },
    role: {
        type: String,
        enum: [ 'user', 'seller' ],
        default: 'user'
    },
    addresses: [
        addressSchema
    ]
})

// Hash password before saving
const bcrypt = require('bcryptjs');
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel; 