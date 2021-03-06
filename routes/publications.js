const express = require('express')
const router = express.Router()
const {createPublication, allPublications, allPublicationsPublic, updatePublication, deletePublication} = require('../controller/publications')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')
// const { clearFacultyFromComponents, clearFacultyFromStudents } = require('../controller/clearingData')

router.post('/create-publication', adminRequiresLogin, createPublication)
router.get('/all-publications', adminRequiresLogin, allPublications)
router.get('/all-publications-public', allPublicationsPublic)
router.post('/update-publication', adminRequiresLogin, updatePublication)
router.post('/delete-publication', adminRequiresLogin, deletePublication)

module.exports  = router