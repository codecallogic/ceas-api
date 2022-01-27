const express = require('express')
const router = express.Router()
const {createPublication, allPublications, updatePublication} = require('../controller/publications')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')
// const { clearFacultyFromComponents, clearFacultyFromStudents } = require('../controller/clearingData')

router.post('/create-publication', adminRequiresLogin, createPublication)
router.get('/all-publications', adminRequiresLogin, allPublications)
router.post('/update-publication', adminRequiresLogin, updatePublication)
// router.post('/delete-staff', adminRequiresLogin, deleteStaff)

module.exports  = router