const express = require('express')
const {studentPro }= require('../controller/controller')
const upload = require('../utility/multer')


const router = express.Router()

router.post('/profile',upload.single('profileImage'),studentPro)

module.exports = router