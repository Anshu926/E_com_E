const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userschema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
}); 

// Use email as the username field
userschema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('User', userschema);
