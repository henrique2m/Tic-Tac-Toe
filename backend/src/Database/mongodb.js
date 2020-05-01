require('dotenv/config');
const mongoose = require('mongoose');

const database = require('../config/database');

const { mongodb } = database;

try {
    mongoose.connect(mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });
} catch (error) {
    console.log(error);
}
