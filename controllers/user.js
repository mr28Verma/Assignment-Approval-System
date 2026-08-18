const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


function userLogin(req,res){
    res.render("user/login",{err: ''})
}

async function moveToDashboard(req, res){
    const { email, password } = req.body;

    const userExist = await User.findOne({ email });

    if (!userExist) {
        return res.render("user/login", { err: 'User does not exist!' });
    }

    const isMatch = await bcrypt.compare(password, userExist.password);

    if (!isMatch) {
        return res.render("user/login", { err: 'Incorrect Password!' });
    }

    const token = jwt.sign({role: userExist.role,name: userExist.name, email: email},process.env.JWT_KEY,{ expiresIn: "1h" });
    res.cookie("User",token, {httpOnly: true});


    if(userExist.role=="Student"){
        res.redirect('/student/dashboard')
    }
    else if(userExist.role=="Professor"){
        res.redirect('/professor/dashboard')
    }
    else{
        res.redirect('/hod/dashboard')
    }  
    
}

module.exports = {userLogin, moveToDashboard}