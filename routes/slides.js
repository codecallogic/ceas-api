const express = require('express')
const router = express.Router()
const {createSlide, allSlides, updateSlide, deleteSlide} = require('../controller/slides')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')
// const { clearFacultyFromComponents, clearFacultyFromStudents } = require('../controller/clearingData')

router.post('/create-slide', adminRequiresLogin, createSlide)
router.get('/all-slides', adminRequiresLogin, allSlides)
router.post('/update-slide', adminRequiresLogin, updateSlide)
router.post('/delete-slide', adminRequiresLogin, deleteSlide)

module.exports  = router