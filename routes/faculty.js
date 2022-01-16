const express = require('express')
const router = express.Router()
const {createFaculty, getFaculty, updateFaculty, deleteFaculty} = require('../controller/faculty')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')

router.post('/create-faculty', adminRequiresLogin, createFaculty)
router.get('/get-all-faculty', adminRequiresLogin, getFaculty)
router.post('/update-faculty', adminRequiresLogin, updateFaculty)
router.post('/delete-faculty', adminRequiresLogin, deleteFaculty)

module.exports  = router