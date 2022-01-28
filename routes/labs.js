const express = require('express')
const router = express.Router()
const {createLab, allLabs, updateLab, deleteLab} = require('../controller/labs')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')
// const { clearFacultyFromComponents, clearFacultyFromStudents } = require('../controller/clearingData')

router.post('/create-lab', adminRequiresLogin, createLab)
router.get('/all-labs', adminRequiresLogin, allLabs)
router.post('/update-lab', adminRequiresLogin, updateLab)
router.post('/delete-lab', adminRequiresLogin, deleteLab)

module.exports  = router