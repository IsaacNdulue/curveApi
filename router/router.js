const express = require('express')
const {studentPro,deleteImage }= require('../controller/controller')
const upload = require('../utility/multer')


const router = express.Router()

router.post('/profile/:id',upload.single('profileImage'),studentPro)
//router.post('/delete',deleteImage)
// Assuming this is your Express route handler

router.delete('/delete',deleteImage)
module.exports = router