const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { connectDB } = require('../config/connectDB');
const User = require('../models/user')
const Department = require('../models/department')


const { home, list, create, deletedept, searchDept, updateDept, createUser, userList, updateUser, deleteUser, getFilteredUsers, adminLogout } = require('../controllers/admin')


router.get('/home', auth.auth, home);

router.post('/department/create',auth.auth, create);

router.get('/department/list',auth.auth, list);

router.get('/department/delete',auth.auth, deletedept);

router.post('/department/search',auth.auth, searchDept);

router.post('/department/update',auth.auth, updateDept);

router.get('/user-form',auth.auth, async (req, res) => {
  res.render("admin/userForm",{msg: ''})
})

router.post('/user/create',auth.auth,createUser)

router.get("/users",auth.auth, userList);

router.post("/users/:id/edit",auth.auth, updateUser);

router.post("/users/:id",auth.auth, deleteUser);

router.get("/user/list",auth.auth, getFilteredUsers);

router.get("/user/search",auth.auth, getFilteredUsers);


router.get('/logout', adminLogout)


module.exports = router;
