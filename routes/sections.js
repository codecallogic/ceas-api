const express = require('express')
const router = express.Router()
const { allSections, createSection } = require('../controller/sections')

// MIDDLEWARE
const { adminRequiresLogin } = require('../controller/auth')

router.get('/all-sections', adminRequiresLogin, allSections)
router.post('/create-section', adminRequiresLogin, createSection)

module.exports  = router