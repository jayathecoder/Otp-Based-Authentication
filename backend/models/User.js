const mongoose = require('mongoose'); // Import mongoose

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    company: String,
    age: Number,
    dob: Date,
    image: String,
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
