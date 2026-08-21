const express = require('express');
const ejs = require('ejs')
const bcrypt = require('bcrypt');
const path = require('path')
const dotenv = require("dotenv")
const cloudinary = require("cloudinary").v2;
const cookieParser = require('cookie-parser')

dotenv.config()

const { connectDB } = require('./config/connectDB');



connectDB();
const authRoute = require('./route/authRoute');
const adminRoute = require('./route/adminRoute');
const userRoute = require('./route/userRoute')
const studentRoute = require('./route/studentRoute')
const professorRoute = require('./route/pofessorRoute')
const hodRoute = require('./route/hodRoute')


const {login} = require('./controllers/serveLogin')
const {createdepartment} = require('./controllers/department')



const app = express();



app.set('view engine','ejs')
app.set('views',path.join(__dirname,'view'));


app.use(express.static(path.join(__dirname, 'public')));
app.use('/student/uploads', express.static('uploads'));
app.use('/student/status/uploads', express.static('uploads'));
app.use('/student/assignment/uploads', express.static('uploads'));
app.use('/student/assignment/history/uploads', express.static('uploads'));
app.use('/student/assignment/edit/uploads', express.static('uploads'));
app.use('/student/assignment/resubmit/uploads', express.static('uploads'));


app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser())


app.use('/auth',authRoute)
app.use('/admin',adminRoute)
app.use('/user',userRoute)
app.use('/student',studentRoute)
app.use('/professor',professorRoute)
app.use('/hod',hodRoute)

app.get('/',login)
app.get('/department/form',createdepartment)



const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Started on port ${PORT}`);
});