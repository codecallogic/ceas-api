const express = require('express')
const router = express.Router()
const {createFaculty, getFaculty} = require('../controller/faculty')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')

router.post('/create-faculty', adminRequiresLogin, createFaculty)
router.get('/get-all-faculty', adminRequiresLogin, getFaculty)

module.exports  = router