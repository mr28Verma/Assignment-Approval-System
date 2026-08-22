const jwt = require('jsonwebtoken');
const Assignment = require('../models/assignment');
const Tracker = require('../models/assignmentTraker');
const { generateSecureOTP } = require('../config/generateOTP');
const { sendMail } = require('../config/sendEmail');
const User = require('../models/user');


// =====================================================
// GET CURRENT PROFESSOR
// =====================================================

async function getCurrentProfessor(req) {

    const token = req.cookies['User'];

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

        if (!user) {
            return null;
        }

        if (user.role !== "Professor") {
            return null;
        }

        return user;

    } catch (error) {

        console.error(
            "Professor authentication error:",
            error
        );

        return null;
    }
}


// =====================================================
// PROFESSOR DASHBOARD
// =====================================================

async function professorDashboard(req, res) {

    try {

        const user =
            await getCurrentProfessor(req);


        if (!user) {
            return res.redirect('/auth/login');
        }


        // Always use CURRENT name from database
        const name =
            user.name;


        // =====================================================
        // GET PROFESSOR ASSIGNMENTS
        // =====================================================

        let submittedAssignment =
            await Assignment.find({
                professor: name
            })
            .sort({
                createdAt: -1
            });


        // =====================================================
        // GET TRACKER INFORMATION
        // =====================================================

        const assignmentIds =
            submittedAssignment.map(
                assignment => assignment._id
            );


        const trackers =
            await Tracker.find({
                assignmentId: {
                    $in: assignmentIds
                }
            });


        // =====================================================
        // ADD alreadyForwarded TO EACH ASSIGNMENT
        // =====================================================

        submittedAssignment =
            submittedAssignment.map(
                assignment => {

                    const tracker =
                        trackers.find(
                            tracker =>
                                tracker.assignmentId.toString() ===
                                assignment._id.toString()
                        );


                    const alreadyForwarded =
                        tracker?.history?.some(
                            item =>
                                item.status === "forwarded"
                        ) || false;


                    return {
                        ...assignment.toObject(),

                        alreadyForwarded
                    };

                }
            );


        // =====================================================
        // COUNTS
        // =====================================================

        const review =
            await Assignment.countDocuments({
                professor: name,
                status: "submitted"
            });


        const totalSubmission =
            await Assignment.countDocuments({
                professor: name
            });


        const approved =
            await Assignment.countDocuments({

                professor: name,

                status: {
                    $in: [
                        "approved",
                        "forwarded"
                    ]
                }

            });


        // =====================================================
        // RENDER DASHBOARD
        // =====================================================

        res.render(
            'user/professor/dashboard',
            {

                name: name,

                assignment:
                    submittedAssignment,

                profilePic:
                    user.profilePic,

                review,

                totalSubmission,

                approved

            }
        );


    } catch (error) {

        console.error(
            "Professor Dashboard Error:",
            error
        );


        res.status(500).send(
            "Unable to load professor dashboard."
        );

    }

}


// =====================================================
// REVIEW ASSIGNMENT
// =====================================================

async function reviewAssignment(req, res) {

    try {

        const user =
            await getCurrentProfessor(req);

        if (!user) {
            return res.redirect('/auth/login');
        }


        const id = req.params.id;


        const assignment =
            await Assignment.findById(id);


        if (!assignment) {

            return res.status(404).send(
                "Assignment not found."
            );

        }


        res.render(
            'user/professor/reviewAssignment',
            {
                assignment
            }
        );


    } catch (error) {

        console.error(
            "Review Assignment Error:",
            error
        );

        res.status(500).send(
            "Unable to load assignment."
        );

    }

}


// =====================================================
// OTP
// =====================================================

let genratedOTP;


// =====================================================
// SEND OTP
// =====================================================

async function sendOTP(req, res) {

    try {

        const user =
            await getCurrentProfessor(req);

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });

        }


        const action =
            req.params.action;


        const {
            assignmentId
        } = req.body;


        if (!assignmentId) {

            return res.status(400).json({
                success: false,
                message: "Assignment ID is required"
            });

        }


        const assignment =
            await Assignment.findById(
                assignmentId
            );


        if (!assignment) {

            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });

        }


        // Generate OTP
        genratedOTP =
            generateSecureOTP();


        await sendMail(

            user.email,

            "Assignment Verification OTP",

            `
            <div style="
                font-family: 'Segoe UI';
                background:#fdf8f4;
                padding:25px;
                border-radius:12px;
            ">

                <h2 style="
                    text-align:center;
                    color:#e07a5f;
                ">
                    Assignment Verification OTP
                </h2>

                <p>
                    Hello Dr. ${user.name},
                </p>

                <p>
                    You requested to
                    <b>${action}</b>
                    an assignment.
                </p>

                <div style="
                    background:#fff;
                    padding:18px;
                    border-radius:10px;
                    border:1px solid #e07a5f;
                    text-align:center;
                ">

                    <h1 style="
                        letter-spacing:8px;
                        color:#e07a5f;
                    ">
                        ${genratedOTP}
                    </h1>

                </div>

                <p>
                    This OTP is required to confirm
                    your decision.
                </p>

            </div>
            `

        );


        return res.json({
            success: true
        });


    } catch (error) {

        console.error(
            "Send OTP Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to send OTP"
        });

    }

}


// =====================================================
// VERIFY OTP
// =====================================================

async function verifyOTP(req, res) {

    try {

        const user =
            await getCurrentProfessor(req);

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });

        }


        const {
            otp,
            remarks,
            action
        } = req.body;


        const id =
            req.params.id;


        if (!otp) {

            return res.json({
                success: false,
                message: "OTP is required"
            });

        }


        if (otp != genratedOTP) {

            return res.json({
                success: false,
                message: "Invalid OTP"
            });

        }


        const assignment =
            await Assignment.findById(id);


        if (!assignment) {

            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });

        }


        // =================================================
        // APPROVE
        // =================================================

        if (action === "Approve") {

            await Assignment.findByIdAndUpdate(
                id,
                {
                    status: "approved",
                    remarks: remarks
                }
            );


            await Tracker.updateOne(

                {
                    assignmentId: id
                },

                {

                    currentStatus: "approved",

                    $push: {

                        history: {

                            status: "approved",

                            updatedBy:
                                user.email

                        }

                    }

                }

            );

        }


        // =================================================
        // REJECT
        // =================================================

        else {

            await Assignment.findByIdAndUpdate(
                id,
                {
                    status: "rejected",
                    remarks: remarks
                }
            );


            await Tracker.updateOne(

                {
                    assignmentId: id
                },

                {

                    currentStatus: "rejected",

                    $push: {

                        history: {

                            status: "rejected",

                            updatedBy:
                                user.email

                        }

                    }

                }

            );

        }


        // Get updated assignment
        const updatedAssignment =
            await Assignment.findById(id);


        // Send email to student
        await sendMail(

            updatedAssignment.email,

            `Assignment Update: ${updatedAssignment.title} - ${updatedAssignment.status}`,

            `
            <div style="
                font-family:'Segoe UI';
                background:#fdf8f4;
                padding:25px;
                border-radius:12px;
            ">

                <h2 style="
                    text-align:center;
                    color:#e07a5f;
                ">
                    Assignment ${updatedAssignment.status}
                </h2>

                <p>
                    Hello ${updatedAssignment.student_name},
                </p>

                <p>
                    Your assignment
                    "<strong>${updatedAssignment.title}</strong>"
                    has been
                    <b>${updatedAssignment.status}</b>.
                </p>

                ${
                    remarks
                    ?
                    `
                    <div style="
                        background:#fff;
                        padding:18px;
                        border-radius:10px;
                        border:1px solid #e6d5c3;
                    ">
                        <p>
                            <strong>Remarks:</strong>
                        </p>

                        <p>
                            ${remarks}
                        </p>

                    </div>
                    `
                    :
                    ""
                }

            </div>
            `

        );


        // OTP should not be reusable
        genratedOTP = null;


        return res.json({
            success: true
        });


    } catch (error) {

        console.error(
            "Verify OTP Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to verify OTP"
        });

    }

}


module.exports = {
    professorDashboard,
    reviewAssignment,
    sendOTP,
    verifyOTP
};