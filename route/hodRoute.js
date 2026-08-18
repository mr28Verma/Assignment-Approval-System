const express = require('express');
const router = express.Router();
const {
    hodDashboard,
    Settings,
    reviewAssignment,
    assignmentApproved,
    assignmentRejected,
    allAssignment
} = require('../controllers/hod')




router.get('/dashboard',hodDashboard);


router.get('/settings',Settings);



router.post(
    '/assignment/review/:id',
    reviewAssignment
);



router.get(
    '/approved',
    assignmentApproved
);

router.get(
    '/rejected',
    assignmentRejected
);

router.get('/submissions/all', allAssignment)


module.exports = router;