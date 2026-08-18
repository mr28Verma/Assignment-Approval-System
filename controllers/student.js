const jwt = require('jsonwebtoken');
const Assignment = require('../models/assignment');
const User = require('../models/user');
const Tracker = require('../models/assignmentTraker');
const cloudinary = require("cloudinary").v2;
const fs = require('fs');
const { sendMail } = require('../config/sendEmail');


// ================= CLOUDINARY =================

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_KEY,
    api_secret: process.env.CLOUD_SECRET
});


// =====================================================
// HELPER: GET CURRENT USER
// =====================================================

async function getCurrentUser(req) {

    const token = req.cookies["User"];

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

        console.log("JWT/User Error:", error);

        return null;
    }
}


// =====================================================
// HELPER: GET STUDENT DASHBOARD DATA
// =====================================================

async function getStudentDashboardData(email) {

    const user = await User.findOne({
        email: email
    });

    if (!user) {
        return null;
    }

    const name = user.name;


    const assignmentDetails =
        await Assignment.find({
            email: email
        })
        .sort({ _id: -1 })
        .limit(5);


    const totalDrafts =
        await Assignment.countDocuments({
            email: email,
            status: 'draft'
        });


    const totalSubmitted =
        await Assignment.countDocuments({
            email: email,
            status: {
                $in: ['submitted', 'resubmitted']
            }
        });


    const totalApproved =
        await Assignment.countDocuments({
            email: email,
            status: 'approved'
        });


    const totalRejected =
        await Assignment.countDocuments({
            email: email,
            status: 'rejected'
        });


    const allProfessor =
        await User.find({
            role: 'Professor'
        });


    return {
        user,
        name,
        assignmentDetails,
        totalDrafts,
        totalSubmitted,
        totalApproved,
        totalRejected,
        allProfessor
    };
}


// =====================================================
// STUDENT HOME
// =====================================================

async function studentHome(req, res) {

    try {

        const user = await getCurrentUser(req);

        if (!user) {
            return res.redirect('/auth/login');
        }


        const data =
            await getStudentDashboardData(
                user.email
            );


        if (!data) {
            return res.status(404).send(
                "User not found"
            );
        }


        res.render(
            "user/student/studentHome",
            {
                assignments: data.assignmentDetails,

                name: data.name,

                totalDrafts:
                    data.totalDrafts,

                totalSubmitted:
                    data.totalSubmitted,

                totalApproved:
                    data.totalApproved,

                totalRejected:
                    data.totalRejected,

                allProfessor:
                    data.allProfessor,

                profilePic:
                    data.user.profilePic
            }
        );


    } catch (error) {

        console.error(
            "Student Home Error:",
            error
        );

        res.status(500).send(
            "Server Error"
        );

    }
}


// =====================================================
// STUDENT UPLOAD PAGE
// =====================================================

function studentDashboard(req, res) {

    res.render(
        "user/student/uploadAssignment",
        {
            success: ''
        }
    );

}


// =====================================================
// UPLOAD ASSIGNMENT
// =====================================================

async function uploadAssignment(req, res) {

    try {

        const user = await getCurrentUser(req);

        if (!user) {
            return res.redirect('/auth/login');
        }


        const name = user.name;
        const email = user.email;


        if (!req.file) {

            return res.render(
                "user/student/uploadAssignment",
                {
                    success: "Please select a PDF file."
                }
            );

        }


        const filePath = req.file.path;


        const result =
            await cloudinary.uploader.upload(
                filePath,
                {
                    resource_type: "raw",
                    format: "pdf"
                }
            );


        const previewUrl =
            result.secure_url;


        const downloadUrl =
            previewUrl.replace(
                "/upload/",
                "/upload/fl_attachment/"
            );


        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }


        const newAssignment =
            await Assignment.create({

                student_name: name,

                email: email,

                title: req.body.title,

                category: req.body.category,

                description: req.body.description,

                upload_path: previewUrl,

                download: downloadUrl

            });


        await Tracker.create({

            assignmentId:
                newAssignment._id,

            studentEmail:
                email,

            currentStatus:
                "draft",

            history: [
                {
                    status: "draft",
                    updatedBy: "student"
                }
            ]

        });


        res.render(
            "user/student/uploadAssignment",
            {
                success:
                    "Assignment upload Successfully!"
            }
        );


    } catch (error) {

        console.error(
            "Upload Assignment Error:",
            error
        );

        res.status(500).send(
            "Unable to upload assignment"
        );

    }

}


// =====================================================
// STATUS FILTER
// =====================================================

async function statusFilter(req, res) {

    try {

        const user = await getCurrentUser(req);

        if (!user) {
            return res.redirect('/auth/login');
        }


        const email = user.email;
        const name = user.name;


        let status;


        if (req.body.status === 'all') {

            status =
                await Assignment.find({
                    email: email
                });

        } else {

            status =
                await Assignment.find({
                    email: email,
                    status: req.body.status
                });

        }


        const totalDrafts =
            await Assignment.countDocuments({
                email: email,
                status: 'draft'
            });


        const totalSubmitted =
            await Assignment.countDocuments({
                email: email,
                status: {
                    $in: ['submitted', 'resubmitted']
                }
            });


        const totalApproved =
            await Assignment.countDocuments({
                email: email,
                status: 'approved'
            });


        const totalRejected =
            await Assignment.countDocuments({
                email: email,
                status: 'rejected'
            });


        const allProfessor =
            await User.find({
                role: 'Professor'
            });


        res.render(
            "user/student/studentHome",
            {

                assignments: status,

                name: name,

                totalDrafts,

                totalSubmitted,

                totalApproved,

                totalRejected,

                allProfessor,

                profilePic:
                    user.profilePic

            }
        );


    } catch (error) {

        console.error(
            "Status Filter Error:",
            error
        );

        res.status(500).send(
            "Server Error"
        );

    }

}


// =====================================================
// ASSIGNMENT FILTER
// =====================================================

async function assignmentFilter(req, res) {

    try {

        const user = await getCurrentUser(req);

        if (!user) {
            return res.redirect('/auth/login');
        }


        const email = user.email;


        let status;


        if (req.body.status === 'all') {

            status =
                await Assignment.find({
                    email: email
                });

        } else {

            status =
                await Assignment.find({
                    email: email,
                    status: req.body.status
                });

        }


        res.render(
            "user/student/assignmentList",
            {
                assignment: status
            }
        );


    } catch (error) {

        console.error(
            "Assignment Filter Error:",
            error
        );

        res.status(500).send(
            "Server Error"
        );

    }

}


// =====================================================
// ALL ASSIGNMENTS
// =====================================================

async function allAssignment(req, res) {

    try {

        const user = await getCurrentUser(req);

        if (!user) {
            return res.redirect('/auth/login');
        }


        const allAssignment =
            await Assignment.find({
                email: user.email
            });


        res.render(
            "user/student/assignmentList",
            {
                assignment: allAssignment
            }
        );


    } catch (error) {

        console.error(
            "All Assignment Error:",
            error
        );

        res.status(500).send(
            "Server Error"
        );

    }

}


// =====================================================
// RENDER ASSIGNMENT
// =====================================================

function renderAssignment(req, res) {

    res.render(
        "user/student/assignmentList",
        {
            assignment: ''
        }
    );

}


// =====================================================
// SUBMIT ASSIGNMENT
// =====================================================

async function submitAssignment(req, res) {

    try {

        const id = req.params.id;


        const user = await getCurrentUser(req);

        if (!user) {
            return res.redirect('/auth/login');
        }


        const email = user.email;
        const name = user.name;


        await Assignment.findByIdAndUpdate(
            id,
            {
                professor: req.body.professorId,
                status: "submitted"
            }
        );


        const submitted =
            await Assignment.findById(id);


        if (!submitted) {

            return res.status(404).send(
                "Assignment not found"
            );

        }


        await Tracker.updateOne(

            {
                assignmentId: id
            },

            {
                currentStatus: "submitted",

                $push: {
                    history: {
                        status: "submitted",
                        updatedBy: "student"
                    }
                }

            }

        );


        const assignment =
            await Assignment.find({
                email: email
            });


        const totalDrafts =
            await Assignment.countDocuments({
                email: email,
                status: 'draft'
            });


        const totalSubmitted =
            await Assignment.countDocuments({
                email: email,
                status: {
                    $in: ['submitted', 'resubmitted']
                }
            });


        const totalApproved =
            await Assignment.countDocuments({
                email: email,
                status: 'approved'
            });


        const totalRejected =
            await Assignment.countDocuments({
                email: email,
                status: 'rejected'
            });


        const allProfessor =
            await User.find({
                role: 'Professor'
            });


        const professor =
            await User.findOne({
                name: req.body.professorId
            });


        if (professor) {

            await sendMail(
                professor.email,

                "New Assignment Submission – University Assignment Approval System",

                `
                <div style="font-family: Arial; line-height: 1.6;">

                    <h2 style="color: #b63d2a;">
                        University Assignment Approval System
                    </h2>

                    <p>
                        The student
                        <strong>${name}</strong>
                        has submitted an assignment.
                    </p>

                    <p>
                        <strong>Assignment Title:</strong>
                        ${submitted.title}
                    </p>

                    <p>
                        Please review it.
                    </p>

                </div>
                `
            );

        }


        res.render(
            "user/student/studentHome",
            {

                assignments: assignment,

                name: name,

                totalDrafts,

                totalSubmitted,

                totalApproved,

                totalRejected,

                allProfessor,

                profilePic:
                    user.profilePic

            }
        );


    } catch (error) {

        console.error(
            "Submit Assignment Error:",
            error
        );

        res.status(500).send(
            "Server Error"
        );

    }

}


// =====================================================
// DELETE ASSIGNMENT
// =====================================================

async function deleteAssignment(req, res) {

    try {

        const id = req.params.id;


        const user = await getCurrentUser(req);

        if (!user) {
            return res.redirect('/auth/login');
        }


        await Assignment.findByIdAndDelete(id);


        const assignment =
            await Assignment.find({
                email: user.email
            });


        const totalDrafts =
            await Assignment.countDocuments({
                email: user.email,
                status: 'draft'
            });


        const totalSubmitted =
            await Assignment.countDocuments({
                email: user.email,
                status: {
                    $in: ['submitted', 'resubmitted']
                }
            });


        const totalApproved =
            await Assignment.countDocuments({
                email: user.email,
                status: 'approved'
            });


        const totalRejected =
            await Assignment.countDocuments({
                email: user.email,
                status: 'rejected'
            });


        const allProfessor =
            await User.find({
                role: 'Professor'
            });


        res.render(
            "user/student/studentHome",
            {

                assignments: assignment,

                name: user.name,

                totalDrafts,

                totalSubmitted,

                totalApproved,

                totalRejected,

                allProfessor,

                profilePic:
                    user.profilePic

            }
        );


    } catch (error) {

        console.error(
            "Delete Assignment Error:",
            error
        );

        res.status(500).send(
            "Server Error"
        );

    }

}


// =====================================================
// ASSIGNMENT HISTORY
// =====================================================

async function assignmentHistory(req, res) {

    try {

        const assignmentDetail =
            await Assignment.findById(
                req.params.id
            );


        if (!assignmentDetail) {

            return res.status(404).send(
                "Assignment not found"
            );

        }


        let tracker =
            await Tracker.findOne({
                assignmentId:
                    req.params.id
            });


        if (!tracker) {

            tracker =
                await Tracker.create({

                    assignmentId:
                        assignmentDetail._id,

                    studentEmail:
                        assignmentDetail.email,

                    currentStatus:
                        assignmentDetail.status,

                    history: [

                        {
                            status:
                                assignmentDetail.status,

                            updatedBy:
                                "system"
                        }

                    ]

                });

        }


        res.render(
            "user/student/viewAssignment",
            {
                assignmentDetail,
                tracker
            }
        );


    } catch (error) {

        console.error(
            "Assignment History Error:",
            error
        );

        res.status(500).send(
            "Server Error"
        );

    }

}


// =====================================================
// EDIT ASSIGNMENT
// =====================================================

async function editAssignment(req, res) {

    try {

        const assignment =
            await Assignment.findById(
                req.params.id
            );


        if (!assignment) {

            return res.render(
                'user/student/editAssignment',
                {
                    error_message:
                        "Assignment not found"
                }
            );

        }


        res.render(
            'user/student/editAssignment',
            {
                assignment,
                msg: ''
            }
        );


    } catch (error) {

        console.error(
            "Edit Assignment Error:",
            error
        );

        res.status(500).send(
            "Server Error"
        );

    }

}


// =====================================================
// UPLOAD EDITED ASSIGNMENT
// =====================================================

async function uploadEditAssignment(req, res) {

    try {

        const id = req.params.id;


        const find =
            await Assignment.findById(id);


        if (!find) {

            return res.render(
                'user/student/editAssignment',
                {
                    assignment: '',
                    msg: 'Assignment not found'
                }
            );

        }


        const {
            title,
            category,
            description
        } = req.body;


        let upload_path =
            find.upload_path;


        let download =
            find.download;


        if (req.file) {

            const filePath =
                req.file.path;


            const result =
                await cloudinary.uploader.upload(
                    filePath,
                    {
                        resource_type: "raw",
                        format: "pdf"
                    }
                );


            upload_path =
                result.secure_url;


            download =
                upload_path.replace(
                    "/upload/",
                    "/upload/fl_attachment/"
                );


            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

        }


        await Assignment.findByIdAndUpdate(
            id,
            {
                title,
                category,
                description,
                upload_path,
                download
            }
        );


        const updatedAssignment =
            await Assignment.findById(id);


        res.render(
            'user/student/editAssignment',
            {
                assignment:
                    updatedAssignment,

                msg:
                    'Assignment Updated Successfully'
            }
        );


    } catch (error) {

        console.error(
            "Upload Edit Assignment Error:",
            error
        );

        res.status(500).send(
            "Server Error"
        );

    }

}


// =====================================================
// RESUBMIT PAGE
// =====================================================

async function resubmitAssignment(req, res) {

    try {

        const assignment =
            await Assignment.findById(
                req.params.id
            );


        if (!assignment) {

            return res.status(404).send(
                "Assignment not found"
            );

        }


        res.render(
            'user/student/resubmitAssignment',
            {
                assignment
            }
        );


    } catch (error) {

        console.error(
            "Resubmit Assignment Error:",
            error
        );

        res.status(500).send(
            "Server Error"
        );

    }

}


// =====================================================
// RESUBMIT UPLOAD
// =====================================================

async function resubmitUploadAssignment(
    req,
    res
) {

    try {

        const id = req.params.id;


        const assignment =
            await Assignment.findById(id);


        if (!assignment) {

            return res.status(404).send(
                "Assignment not found"
            );

        }


        const user =
            await getCurrentUser(req);


        if (!user) {
            return res.redirect('/auth/login');
        }


        const {
            description
        } = req.body;


        let upload_path =
            assignment.upload_path;


        let downloadUrl =
            assignment.download;


        if (req.file) {

            const filePath =
                req.file.path;


            const result =
                await cloudinary.uploader.upload(
                    filePath,
                    {
                        resource_type: "raw",
                        format: "pdf"
                    }
                );


            upload_path =
                result.secure_url;


            downloadUrl =
                upload_path.replace(
                    "/upload/",
                    "/upload/fl_attachment/"
                );


            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

        }


        await Assignment.findByIdAndUpdate(
            id,
            {
                description:
                    description,

                upload_path:
                    upload_path,

                download:
                    downloadUrl,

                status:
                    "resubmitted"
            }
        );


        await Tracker.updateOne(

            {
                assignmentId: id
            },

            {

                currentStatus:
                    "resubmitted",

                $push: {

                    history: {

                        status:
                            "resubmitted",

                        updatedBy:
                            "student"

                    }

                }

            }

        );


        const assignmentDetails =
            await Assignment.find({
                email: user.email
            })
            .sort({ _id: -1 })
            .limit(5);


        const totalDrafts =
            await Assignment.countDocuments({
                email: user.email,
                status: 'draft'
            });


        const totalSubmitted =
            await Assignment.countDocuments({
                email: user.email,
                status: {
                    $in: ['submitted', 'resubmitted']
                }
            });


        const totalApproved =
            await Assignment.countDocuments({
                email: user.email,
                status: 'approved'
            });


        const totalRejected =
            await Assignment.countDocuments({
                email: user.email,
                status: 'rejected'
            });


        const allProfessor =
            await User.find({
                role: 'Professor'
            });


        await sendMail(

            user.email,

            "Assignment Resubmission Successful – University Assignment Approval System",

            `
            <div style="font-family: Arial;">

                <h2 style="color: #b63d2a;">
                    University Assignment Approval System
                </h2>

                <p>
                    Your assignment has been
                    resubmitted successfully.
                </p>

                <p>
                    <strong>Assignment File:</strong>
                    ${
                        req.file
                            ? req.file.originalname
                            : upload_path.split('/').pop()
                    }
                </p>

            </div>
            `

        );


        res.render(
            "user/student/studentHome",
            {

                assignments:
                    assignmentDetails,

                name:
                    user.name,

                totalDrafts,

                totalSubmitted,

                totalApproved,

                totalRejected,

                allProfessor,

                profilePic:
                    user.profilePic

            }
        );


    } catch (error) {

        console.error(
            "Resubmit Upload Error:",
            error
        );

        res.status(500).send(
            "Server Error"
        );

    }

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

    studentHome,

    studentDashboard,

    uploadAssignment,

    statusFilter,

    assignmentFilter,

    allAssignment,

    renderAssignment,

    submitAssignment,

    deleteAssignment,

    assignmentHistory,

    editAssignment,

    uploadEditAssignment,

    resubmitAssignment,

    resubmitUploadAssignment

};