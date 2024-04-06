const mongoose = require('mongoose');
const exif = require('exif-parser');

const studentSchema = new mongoose.Schema({
    fullName:{
        type:String
    },
    stack:{
        type:String,
    },
    location: {
        type:String,
    },
    mark:{
        type:String
    },
    time:{
        type:Date,
        default:Date.now
    },
    profileImage:{
        type:String
    }
},{timestamps:true});

const studentModel = mongoose.model('student', studentSchema);

module.exports = studentModel;