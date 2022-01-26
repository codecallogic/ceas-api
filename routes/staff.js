const express = require('express')
const router = express.Router()
const {createStaff, allStaff} = require('../controller/staff')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')
// const { clearFacultyFromComponents, clearFacultyFromStudents } = require('../controller/clearingData')

router.post('/create-staff', adminRequiresLogin, createStaff)
router.get('/all-staff', adminRequiresLogin, allStaff)
// router.post('/update-faculty', adminRequiresLogin, updateFaculty)
// router.post('/delete-faculty', adminRequiresLogin, clearFacultyFromComponents, clearFacultyFromStudents, deleteFaculty)

module.exports  = router