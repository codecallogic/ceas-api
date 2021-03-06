const express = require('express')
const router = express.Router()
const { allSections, allSectionsPublic, createSection, updateSection, deleteSection } = require('../controller/sections')

// MIDDLEWARE
const { adminRequiresLogin } = require('../controller/auth')

router.get('/all-sections', adminRequiresLogin, allSections)
router.get('/all-sections-public', allSectionsPublic)
router.post('/create-section', adminRequiresLogin, createSection)
router.post('/update-section', adminRequiresLogin, updateSection)
router.post('/delete-section', adminRequiresLogin, deleteSection)

module.exports  = router