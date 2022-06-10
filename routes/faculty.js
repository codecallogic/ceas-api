const express = require('express')
const router = express.Router()
const {createFaculty, getFaculty, getFacultyPublic, updateFaculty, deleteFaculty} = require('../controller/faculty')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')
const { clearFacultyFromComponents, clearFacultyFromStudents, clearFacultyFromPublications, clearFacultyFromLabs } = require('../controller/clearingData')

router.post('/create-faculty', adminRequiresLogin, createFaculty)
router.get('/get-all-faculty', adminRequiresLogin, getFaculty)
router.get('/get-all-faculty-public', getFacultyPublic)
router.post('/update-faculty', adminRequiresLogin, updateFaculty)
router.post('/delete-faculty', adminRequiresLogin, clearFacultyFromComponents, clearFacultyFromStudents, clearFacultyFromPublications, clearFacultyFromLabs, deleteFaculty)

module.exports  = router