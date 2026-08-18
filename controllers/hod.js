const jwt = require('jsonwebtoken');
const Assignment = require('../models/assignment');
const Tracker = require('../models/assignmentTraker');
const { generateSecureOTP } = require('../config/generateOTP');
const { sendMail } = require('../config/sendEmail');
const User = require('../models/user');

async function getCurrentUser(req) {

    const token = req.cookies.User;

    if (!token) {
        return null;
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_KEY
        );

        if (!decoded.email) {
            return null;
        }

        const user = await User.findOne({
            email: decoded.email
        });

        return user;

    } catch (error) {

        console.error(
            "JWT Error:",
            error.message
        );

        return null;
    }
}

async function hodDashboard(req, res) {

    try {

        const user = await getCurrentUser(req);


        if (!user) {
            return res.redirect('/auth/login');
        }


        if (user.role !== "Hod") {
            return res.status(403).send(
                "Access denied"
            );
        }


        // =================================================
        // FACULTY COUNT
        // =================================================

        const faculty =
            await User.countDocuments({
                department: user.department,
                role: "Professor"
            });


        // =================================================
        // IMPORTANT
        // GET ALL FORWARDED ASSIGNMENTS
        // =================================================

        const pendingAssignments =
            await Assignment.find({
                status: "forwarded"
            })
                .sort({
                    createdAt: -1
                });


        console.log(
            "HOD:",
            user.name
        );

        console.log(
            "Forwarded assignments:",
            pendingAssignments.length
        );


        // Debug
        pendingAssignments.forEach(
            assignment => {

                console.log({

                    id: assignment._id,

                    title: assignment.title,

                    student:
                        assignment.student_name,

                    professor:
                        assignment.professor,

                    status:
                        assignment.status

                });

            }
        );

        const approved = await Tracker.countDocuments({
            currentStatus: "approved",
            history: {
                $elemMatch: {
                    status: "forwarded"
                }
            }
        });

        const rejected = await Tracker.countDocuments({
            currentStatus: "rejected",
            history: {
                $elemMatch: {
                    status: "forwarded"
                }
            }
        });


        // =================================================
        // RENDER
        // =================================================

        return res.render(
            'user/hod/dashboard',
            {

                name:
                    user.name,

                assignments:
                    pendingAssignments,

                profilePic:
                    user.profilePic,

                pending:
                    pendingAssignments.length,

                faculty:
                    faculty,

                approved:
                    approved,

                rejected:
                    rejected


            }
        );


    } catch (error) {

        console.error(
            "HOD Dashboard Error:",
            error
        );

        return res.status(500).send(
            "Server Error"
        );

    }

}

async function Settings(req, res) {

    try {

        const user =
            await getCurrentUser(req);


        if (!user) {
            return res.redirect('/auth/login');
        }


        if (user.role !== "Hod") {

            return res.status(403).send(
                "Access denied"
            );

        }


        return res.render(
            'user/editProfile',
            {

                user:
                    user,

                success:
                    false

            }
        );


    } catch (error) {

        console.error(
            "HOD Settings Error:",
            error
        );

        return res.status(500).send(
            "Unable to load settings."
        );

    }

}


async function reviewAssignment(req, res) {

    try {

        const {
            id
        } = req.params;


        const {
            action,
            remarks
        } = req.body;


        // =================================================
        // GET HOD
        // =================================================

        const hod =
            await getCurrentUser(req);


        if (!hod) {

            return res.redirect(
                '/auth/login'
            );

        }


        if (hod.role !== "Hod") {

            return res.status(403).send(
                "Access denied"
            );

        }


        // =================================================
        // VALIDATE ACTION
        // =================================================

        if (!action) {

            return res.status(400).send(
                "Action is required"
            );

        }


        if (
            action !== "approve" &&
            action !== "reject"
        ) {

            return res.status(400).send(
                "Invalid action"
            );

        }


        // =================================================
        // FIND ASSIGNMENT
        // =================================================

        const assignment =
            await Assignment.findById(id);


        if (!assignment) {

            return res.status(404).send(
                "Assignment not found"
            );

        }


        // =================================================
        // ONLY FORWARDED CAN BE REVIEWED BY HOD
        // =================================================

        if (
            assignment.status !== "forwarded"
        ) {

            return res.status(400).send(
                "Assignment is not waiting for HOD approval."
            );

        }


        // =================================================
        // FIND TRACKER
        // =================================================

        let tracker =
            await Tracker.findOne({
                assignmentId: id
            });


        // If tracker doesn't exist, create it
        if (!tracker) {

            tracker =
                await Tracker.create({

                    assignmentId:
                        assignment._id,

                    studentEmail:
                        assignment.email,

                    currentStatus:
                        assignment.status,

                    history: [

                        {
                            status:
                                assignment.status,

                            updatedBy:
                                "system",

                            timestamp:
                                new Date()

                        }

                    ]

                });

        }


        // =================================================
        // HOD APPROVE
        // FORWARDED -> APPROVED
        // =================================================

        if (
            action === "approve"
        ) {


            assignment.status =
                "approved";


            if (
                remarks &&
                remarks.trim() !== ""
            ) {

                assignment.remarks =
                    remarks.trim();

            }


            await assignment.save();


            tracker.currentStatus =
                "approved";


            tracker.history.push({

                status:
                    "approved",

                timestamp:
                    new Date(),

                updatedBy:
                    hod.name

            });


            await tracker.save();


            console.log(
                "HOD APPROVED:",
                assignment._id
            );


            return res.redirect(
                '/hod/dashboard'
            );

        }


        // =================================================
        // HOD REJECT
        // FORWARDED -> REJECTED
        // =================================================

        if (
            action === "reject"
        ) {


            assignment.status =
                "rejected";


            if (
                remarks &&
                remarks.trim() !== ""
            ) {

                assignment.remarks =
                    remarks.trim();

            }


            await assignment.save();


            tracker.currentStatus =
                "rejected";


            tracker.history.push({

                status:
                    "rejected",

                timestamp:
                    new Date(),

                updatedBy:
                    hod.name

            });


            await tracker.save();


            console.log(
                "HOD REJECTED:",
                assignment._id
            );


            return res.redirect(
                '/hod/dashboard'
            );

        }


    } catch (error) {

        console.error(
            "HOD Review Error:",
            error
        );

        return res.status(500).send(
            "Internal Server Error"
        );

    }

}

async function assignmentApproved(req, res) {

    try {

        const user =
            await getCurrentUser(req);


        if (!user) {
            return res.redirect(
                '/auth/login'
            );
        }


        if (user.role !== "Hod") {

            return res.status(403).send(
                "Access denied"
            );

        }


        const assignments =
            await Assignment.find({
                status: "approved"
            })
                .sort({
                    createdAt: -1
                });


        return res.render(
            'user/hod/approved',
            {
                assignments
            }
        );


    } catch (error) {

        console.error(
            "Approved Assignment Error:",
            error
        );

        return res.status(500).send(
            "Unable to load approved assignments."
        );

    }

}


async function assignmentRejected(req, res) {

    try {

        const user =
            await getCurrentUser(req);


        if (!user) {
            return res.redirect(
                '/auth/login'
            );
        }


        if (user.role !== "Hod") {

            return res.status(403).send(
                "Access denied"
            );

        }


        const assignments =
            await Assignment.find({
                status: "rejected"
            })
                .sort({
                    createdAt: -1
                });


        return res.render(
            'user/hod/rejected',
            {
                assignments
            }
        );


    } catch (error) {

        console.error(
            "Rejected Assignment Error:",
            error
        );

        return res.status(500).send(
            "Unable to load rejected assignments."
        );

    }

}


async function allAssignment(req, res) {

    try {

        const user = await getCurrentUser(req);


        if (!user) {
            return res.redirect('/auth/login');
        }


        if (user.role !== "Hod") {
            return res.status(403).send("Access denied");
        }


        // ============================================
        // GET FACULTY OF HOD'S DEPARTMENT
        // ============================================

        const faculties = await User.find({
            department: user.department,
            role: "Professor"
        }).select("_id name username");


        // ============================================
        // GET ALL DEPARTMENT ASSIGNMENTS
        // ============================================

        const assignments = await Assignment.find({
            status: {
                $in: [

                    "forwarded"

                ]
            }
        }).sort({
            createdAt: -1
        });


        // ============================================
        // DEFAULT FILTERS
        // ============================================

        const currentFilters = {

            status: "all",

            facultyId: "all",

            category: "all"

        };


        // ============================================
        // RENDER
        // ============================================

        return res.render(
            "user/hod/assignmentList",
            {

                assignments: assignments,

                // Keep this if your EJS expects
                // assignment somewhere else
                assignment: assignments,

                faculties: faculties,

                currentFilters: currentFilters

            }
        );


    } catch (error) {

        console.error(
            "All Assignment Error:",
            error
        );

        return res.status(500).send(
            "Server Error"
        );

    }

}

module.exports = {
    hodDashboard,
    Settings,
    reviewAssignment,
    assignmentApproved,
    assignmentRejected,
    allAssignment
}