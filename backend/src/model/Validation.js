require('dotenv/config');
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const authConfig = require('../config/auth');

const ValidationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        code: String,
        attempt: {
            type: Number,
            default: 0,
            max: 3,
        },
    },
    { timestamps: true }
);

ValidationSchema.pre('save', async function(next) {
    const { sal } = authConfig;
    const codeSal = `${this.code}${sal}`;
    const hash = await bcryptjs.hash(codeSal, 15);
    this.code = hash;

    next();
});

const Validation = mongoose.model('Validation', ValidationSchema);

module.exports = Validation;
