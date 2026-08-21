const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ActivityLog = require('../models/ActivityLog');

const ADMIN_STATIC_ID = process.env.ADMIN_STATIC_ID;

function login(req, res) {
    res.render('login_portal');
}

async function adminLogin(req, res) {
    const { username, password } = req.body;

    try {
        if (username !== process.env.ADMIN_USERNAME) {
            return res.render("login_portal", {
                err: "Username invalid!"
            });
        }

        const match = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);

        if (!match) {
            return res.render("login_portal", {
                err: "Password invalid!"
            });
        }

        const token = jwt.sign(
            { _id: ADMIN_STATIC_ID, username, role: "Admin" },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );

        res.cookie("admin", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        await ActivityLog.create({
            actionType: 'LOGIN',
            entityType: 'System',
            description: `Admin logged in.`,
            performedBy: ADMIN_STATIC_ID,
            icon: 'log-in',
            color: 'var(--border-emerald)'
        });

        res.redirect('/admin/home');

    } catch (err) {
        console.error(err);

        res.render("login_portal", {
            err: "Server Error!"
        });
    }
}

module.exports = { login, adminLogin };
