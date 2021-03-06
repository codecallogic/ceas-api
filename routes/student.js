const express = require('express')
const router = express.Router()
const {createStudent, getStudents, getStudentsPublic, updateStudent, deleteStudent} = require('../controller/student')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')

router.post('/create-student', adminRequiresLogin, createStudent)
router.get('/get-all-students', adminRequiresLogin, getStudents)
router.get('/get-all-students-public', getStudentsPublic)
router.post('/update-student', adminRequiresLogin, updateStudent)
router.post('/delete-student', adminRequiresLogin, deleteStudent)

module.exports  = router