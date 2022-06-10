const express = require('express')
const router = express.Router()
const {createStaff, allStaff, allStaffPublic, updateStaff, deleteStaff} = require('../controller/staff')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')
// const { clearFacultyFromComponents, clearFacultyFromStudents } = require('../controller/clearingData')

router.post('/create-staff', adminRequiresLogin, createStaff)
router.get('/all-staff', adminRequiresLogin, allStaff)
router.get('/all-staff-public', allStaffPublic)
router.post('/update-staff', adminRequiresLogin, updateStaff)
router.post('/delete-staff', adminRequiresLogin, deleteStaff)

module.exports  = router