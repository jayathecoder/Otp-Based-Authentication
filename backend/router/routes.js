const multer = require('multer');
const otpGenerator = require('otp-generator');
const path = require('path');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const myRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const {loginvalidation, registervalidation} = require('../middlewares/validate');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    cb('Error: Images only!');
}});

myRouter.post('/register', upload.single('image'),  async (req, res) => {
    try {
        const { name, email, password, company, age, dob } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, company, age, dob, image: req.file.path });
        await newUser.save();
        res.status(201).json({message: 'Account Created'});
    } catch (error) {
        res.status(400).send(error.message);
    }
});

myRouter.post('/login',  async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const otp = Math.floor(Math.random()*900000);
            console.log(otp);
            const otpExpires = new Date(Date.now() + 10 * 60000);
            await User.updateOne({ email }, { otp, otpExpires });
            res.status(200).json({message: `OTP Sent: ${otp}`});
        } else {
            res.redirect('/error');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

myRouter.post('/verify-otp', async (req, res) => {
    try {
        console.log(req.body)
        const { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        console.log(user.otp);
        // Check if OTP matches and is still valid
        if (user.otp !== otp || user.otpExpires < new Date()) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        const jwtToken = jwt.sign(
            {email: user.email, _id: user._id},
            process.env.JWT_SECRET,
            {expiresIn: '24h'}
        )

        // OTP is valid: Clear OTP fields and authenticate user
        user.otp = null;
        user.otpExpires = null;
        await user.save();
        console.log(otp);
        // Store user session (if using sessions)
        req.session.user = user;

        return res.json({ message: `Welcome ${user.name}`, user, jwtToken });

    } catch (error) {
        console.error("Error verifying OTP:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


myRouter.get('/error', (req, res) => {
    res.send("Something went wrong!");
});

myRouter.post('/delete-account', async (req, res) => {
    const { email } = req.body;
    await User.deleteOne({ email });
    res.send('Account Deleted');
});

module.exports = myRouter;
