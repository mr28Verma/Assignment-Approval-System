const mongoose = require("mongoose");


const assignmentSchema = new mongoose.Schema({

  student_name: {
    type: String
  },
  email: {
    type: String
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ["assignment","report","thesis","presentation"],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  upload_path:{
    type: String,
    required: true
  },
  download: {
    type: String,
    require: true
  },
  submit:{
    type: String,
    default: new Date().toDateString()
  },
  professor: {
    type: String,
    default: ""
  },
  status:{
    type: String,
    enum: ["draft","submitted","approved","rejected","resubmitted","forwarded"],
    default: "draft"
  },
  remark: {
    type: String,
    default: ""
  }
});

const Assignment = mongoose.model("assignments", assignmentSchema);

module.exports = Assignment;
