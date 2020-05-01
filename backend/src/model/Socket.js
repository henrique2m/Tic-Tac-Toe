const mongoose = require('mongoose');

const SocketSchema = new mongoose.Schema(
    {
        idSocket: String,
        playing: {
            type: Boolean,
            default: false,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }
);

const Socket = mongoose.model('Socket', SocketSchema);

module.exports = Socket;
