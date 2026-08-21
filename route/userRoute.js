const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');

const User = require('../models/user');

const { sendMail } = require('../config/sendEmail');

const { generateSecureOTP } = require('../config/generateOTP');

const cloudinary = require("cloudinary").v2;

const { upload2 } = require('../config/multer');

const fs = require('fs');

const {  moveToDashboard } = require('../controllers/user');

const hashPass = require('../hashPassword');


// ================= LOGIN =================


router.post('/login', moveToDashboard);


// ================= FORGET PASSWORD =================

router.get('/forget', (req, res) => {

    res.render("user/forgetPass", { err: '' });

});


// ================= OTP STORAGE =================

let storedOTP = "";
let storedEmail = "";


// ================= SEND OTP =================

router.post("/send-otp", async (req, res) => {

    try {

        const email = req.body.email;

        const exist = await User.findOne({ email });

        if (!exist) {

            return res.json({
                success: false,
                message: "User not found! Please enter a registered university email."
            });

        }

        const otp = generateSecureOTP();

        storedOTP = otp;
        storedEmail = email;

        const mailStatus = await sendMail(
            email,
            "University Assignment Portal - OTP Verification",
            `
            <div style="font-family: Arial, sans-serif; padding: 20px; background:#f5f5f5;">

                <div style="max-width: 500px; margin: auto; background: white; padding: 25px; border-radius: 10px;">

                    <h2 style="color:#333; text-align: center;">
                        University Assignment Approval System
                    </h2>

                    <p style="font-size: 15px;">
                        Dear Student,
                    </p>

                    <p style="font-size: 15px;">
                        You requested to reset your password.
                    </p>

                    <h1 style="letter-spacing: 5px; text-align:center; color:#e68b74;">
                        ${otp}
                    </h1>

                    <p style="font-size: 14px;">
                        OTP valid for 10 minutes.
                    </p>

                    <p style="font-size: 14px;">
                        Regards,<br>
                        University Assignment Approval System
                    </p>

                </div>

            </div>
            `
        );

        if (!mailStatus) {

            return res.json({
                success: false,
                message: "Failed to send OTP mail"
            });

        }

        return res.json({
            success: true,
            email,
            message: "OTP sent successfully!"
        });

    } catch (error) {

        console.log(error);

        return res.json({
            success: false,
            message: "Server Error"
        });

    }

});


// ================= RESET PASSWORD =================

router.post("/reset-password", async (req, res) => {

    try {

        const { otp, newPassword, confirmPassword } = req.body;

        if (otp !== storedOTP) {

            return res.json({
                success: false,
                message: "Invalid OTP"
            });

        }

        if (newPassword !== confirmPassword) {

            return res.json({
                success: false,
                message: "Passwords do not match"
            });

        }

        const hashPassword = await hashPass(newPassword);

        await User.findOneAndUpdate(
            { email: storedEmail },
            {
                $set: {
                    password: hashPassword
                }
            }
        );

        return res.json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {

        console.log(error);

        return res.json({
            success: false,
            message: "Server Error"
        });

    }

});


// ================= CLOUDINARY =================

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});


// ================= UPDATE PROFILE =================

router.post('/update/profile', upload2.single('profileImage'), async (req, res) => {

    try {

        let email;

        let token = req.cookies["User"];

        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {

            email = decoded.email;

        });

        let { name } = req.body;

        if (req.file) {

            const filePath = req.file.path;

            const result = await cloudinary.uploader.upload(filePath, {
                resource_type: "image",
            });

            const profile = result.secure_url;

            fs.unlinkSync(filePath);

            await User.updateOne(
                { email: email },
                {
                    $set: {
                        name: name,
                        profilePic: profile
                    }
                }
            );

        } else {

            await User.updateOne(
                { email: email },
                {
                    $set: {
                        name: name
                    }
                }
            );

        }

        let user = await User.findOne({ email: email });

        res.render("user/editProfile", {
            user: user,
            success: true
        });

    } catch (error) {

        console.log(error);

    }

});


// ================= UPDATE PASSWORD =================

router.post('/update/password', async (req, res) => {

    try {

        const { newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {

            return res.render("user/editProfile", {
                success: false
            });

        }

        let email;

        let token = req.cookies["User"];

        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {

            email = decoded.email;

        });

        let newHashPass = await hashPass(newPassword);

        await User.updateOne(
            { email: email },
            {
                $set: {
                    password: newHashPass
                }
            }
        );

        let user = await User.findOne({ email: email });

        res.render("user/editProfile", {
            user: user,
            success: true
        });

    } catch (error) {

        console.log(error);

    }

});


// ================= UNAUTHORIZED =================

router.get('/unauthorized/login', (req, res) => {

    res.render('user/unauthorized');

});


// ================= EXPORT =================

module.exports = router;