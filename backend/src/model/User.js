require('dotenv/config');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const authConfig = require('../config/auth');

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        avatar: {
            type: String,
            required: true,
        },
        validation: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

UserSchema.pre('save', async function(next) {
    const { sal } = authConfig;
    const passwordSal = `${this.password}${sal}`;
    const hash = await bcryptjs.hash(passwordSal, 15);
    this.password = hash;

    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
