const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Assignment = require('../models/assignment');
const User = require('../models/user');
const Tracker = require('../models/assignmentTraker');

const {
    professorDashboard,
    reviewAssignment,
    sendOTP,
    verifyOTP
} = require('../controllers/professor');

const {
    sendMail
} = require('../config/sendEmail');

const {
    verifyToken,
    professorOnly
} = require('../middleware/userAuth');


// =====================================================
// PROFESSOR DASHBOARD
// =====================================================

router.get(
    '/dashboard',
    verifyToken,
    professorOnly,
    professorDashboard
);


// =====================================================
// REVIEW ASSIGNMENT
// =====================================================

router.get(
    '/review/:id',
    verifyToken,
    professorOnly,
    reviewAssignment
);


// =====================================================
// SEND OTP
// =====================================================

router.post(
    '/send-otp/:action',
    verifyToken,
    professorOnly,
    sendOTP
);


// =====================================================
// VERIFY OTP
// =====================================================

router.post(
    '/verify-otp/:id',
    verifyToken,
    professorOnly,
    verifyOTP
);


// =====================================================
// FILTER ASSIGNMENTS
// =====================================================

router.post(
    '/filterAssignment',
    verifyToken,
    professorOnly,
    async (req, res) => {

        try {

            const token =
                req.cookies['User'];


            if (!token) {
                return res.redirect('/auth/login');
            }


            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_KEY
                );


            const user =
                await User.findOne({
                    email: decoded.email
                });


            if (!user) {

                return res.status(404).send(
                    "Professor not found."
                );

            }


            if (user.role !== "Professor") {

                return res.status(403).send(
                    "Access denied."
                );

            }


            const name =
                user.name;


            let assignment;


            if (req.body.status === 'all') {

                assignment =
                    await Assignment.find({
                        professor: name
                    })
                    .sort({
                        createdAt: -1
                    })
                    .limit(5);

            } else {

                assignment =
                    await Assignment.find({

                        professor: name,

                        status:
                            req.body.status

                    })
                    .sort({
                        createdAt: -1
                    })
                    .limit(5);

            }


            res.render(
                'user/professor/dashboard',
                {

                    name: name,

                    assignment: assignment,

                    profilePic:
                        user.profilePic,

                    review:
                        await Assignment.countDocuments({
                            professor: name,
                            status: "submitted"
                        }),

                    totalSubmission:
                        await Assignment.countDocuments({
                            professor: name
                        }),

                    approved:
                        await Assignment.countDocuments({
                            professor: name,
                            status: {
                                $in: [
                                    "approved",
                                    "forwarded"
                                ]
                            }
                        })

                }
            );


        } catch (err) {

            console.error(
                "Professor Filter Error:",
                err
            );

            res.status(500).send(
                "Unable to filter assignments."
            );

        }

    }
);


// =====================================================
// ALL ASSIGNMENTS
// =====================================================

router.get(
    '/assignment/all',
    verifyToken,
    professorOnly,
    async (req, res) => {

        try {

            const token =
                req.cookies['User'];


            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_KEY
                );


            const user =
                await User.findOne({
                    email: decoded.email
                });


            if (!user) {

                return res.status(404).send(
                    "Professor not found."
                );

            }


            if (user.role !== "Professor") {

                return res.status(403).send(
                    "Access denied."
                );

            }


            const assignment =
                await Assignment.find({
                    professor: user.name
                });


            res.render(
                'user/professor/allAssignment',
                {
                    assignment
                }
            );


        } catch (err) {

            console.error(
                "All Assignment Error:",
                err
            );

            res.status(500).send(
                "Unable to load assignments."
            );

        }

    }
);


// =====================================================
// ALL ASSIGNMENT FILTER
// =====================================================

router.post(
    '/allfilterAssignment',
    verifyToken,
    professorOnly,
    async (req, res) => {

        try {

            const token =
                req.cookies['User'];


            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_KEY
                );


            const user =
                await User.findOne({
                    email: decoded.email
                });


            if (!user) {

                return res.status(404).send(
                    "Professor not found."
                );

            }


            if (user.role !== "Professor") {

                return res.status(403).send(
                    "Access denied."
                );

            }


            const name =
                user.name;


            let assignment;


            if (req.body.status === 'all') {

                assignment =
                    await Assignment.find({
                        professor: name
                    });

            } else {

                assignment =
                    await Assignment.find({

                        professor: name,

                        status:
                            req.body.status

                    });

            }


            res.render(
                'user/professor/allAssignment',
                {
                    assignment
                }
            );


        } catch (err) {

            console.error(
                "All Assignment Filter Error:",
                err
            );

            res.status(500).send(
                "Unable to filter assignments."
            );

        }

    }
);


// =====================================================
// PROFESSOR SETTINGS
// =====================================================

router.get(
    '/settings',
    verifyToken,
    professorOnly,
    async (req, res) => {

        try {

            const token =
                req.cookies['User'];


            if (!token) {
                return res.redirect('/auth/login');
            }


            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_KEY
                );


            // IMPORTANT:
            // Do NOT use req.query.name
            const user =
                await User.findOne({
                    email: decoded.email
                });


            if (!user) {

                return res.status(404).send(
                    "Professor not found."
                );

            }


            if (user.role !== "Professor") {

                return res.status(403).send(
                    "Access denied."
                );

            }


            res.render(
                'user/editProfile',
                {
                    user: user,
                    success: false
                }
            );


        } catch (err) {

            console.error(
                "Professor Settings Error:",
                err
            );

            res.status(500).send(
                "Unable to load settings."
            );

        }

    }
);

// =====================================================
// FORWARD ASSIGNMENT TO HOD
// =====================================================

router.get(
    '/forward/:id',
    verifyToken,
    professorOnly,
    async (req, res) => {

        try {

            const id =
                req.params.id;


            const token =
                req.cookies['User'];


            const decoded =
                jwt.verify(
                    token,
                    process.env.JWT_KEY
                );


            // Find professor by EMAIL
            const professor =
                await User.findOne({
                    email: decoded.email
                });


            if (!professor) {

                return res.status(404).send(
                    "Professor not found."
                );

            }


            if (professor.role !== "Professor") {

                return res.status(403).send(
                    "Access denied."
                );

            }


            const assignment =
                await Assignment.findById(id);


            if (!assignment) {

                return res.status(404).send(
                    "Assignment not found."
                );

            }


            // =====================================================
            // CHECK ASSIGNMENT STATUS
            // =====================================================

            if (assignment.status !== "approved") {

                return res.status(400).send(
                    "Only approved assignments can be forwarded."
                );

            }


            // =====================================================
            // CHECK TRACKER HISTORY
            // =====================================================

            const tracker =
                await Tracker.findOne({
                    assignmentId: id
                });


            const alreadyForwarded =
                tracker?.history?.some(
                    item => item.status === "forwarded"
                );


            // =====================================================
            // PREVENT FORWARDING AGAIN AFTER HOD APPROVAL
            // =====================================================

            if (alreadyForwarded) {

                return res.status(400).send(
                    "This assignment has already been forwarded to HOD."
                );

            }


            // =====================================================
            // FIND HOD
            // =====================================================

            const hod =
                await User.findOne({

                    department:
                        professor.department,

                    role:
                        "Hod"

                });


            if (!hod) {

                return res.status(404).send(
                    "HOD for this department was not found."
                );

            }


            // =====================================================
            // CHANGE ASSIGNMENT STATUS
            // =====================================================

            assignment.status =
                "forwarded";


            await assignment.save();


            // =====================================================
            // UPDATE TRACKER
            // =====================================================

            await Tracker.updateOne(

                {
                    assignmentId: id
                },

                {

                    currentStatus:
                        "forwarded",

                    $push: {

                        history: {

                            status:
                                "forwarded",

                            updatedBy:
                                professor.email

                        }

                    }

                }

            );


            // =====================================================
            // SEND EMAIL TO HOD
            // =====================================================

            await sendMail(

                hod.email,

                "Assignment Forwarded – University Assignment Approval System",

                `
                <div style="
                    font-family: Arial;
                    line-height: 1.6;
                    background:#fdf8f4;
                    padding:30px;
                ">

                    <div style="
                        max-width:600px;
                        margin:auto;
                        background:white;
                        padding:30px;
                    ">

                        <h2 style="
                            color:#b63d2a;
                        ">
                            University Assignment Approval System
                        </h2>


                        <p>
                            Hello
                            <strong>Dr. ${hod.name}</strong>,
                        </p>


                        <p>
                            Professor
                            <strong>
                                Dr. ${professor.name}
                            </strong>
                            has forwarded an assignment
                            for your review.
                        </p>


                        <p>
                            <strong>Student:</strong>
                            ${assignment.student_name}
                        </p>


                        <p>
                            <strong>Assignment Title:</strong>
                            ${assignment.title}
                        </p>


                        <p>
                            Please log in to the HOD dashboard
                            to review the assignment.
                        </p>


                    </div>

                </div>
                `

            );


            // =====================================================
            // REDIRECT TO PROFESSOR DASHBOARD
            // =====================================================

            res.redirect(
                '/professor/dashboard?success=forwarded'
            );


        } catch (err) {

            console.error(
                "Forward Assignment Error:",
                err
            );


            res.status(500).send(
                "An error occurred while forwarding the assignment."
            );

        }

    }
);


module.exports = router;