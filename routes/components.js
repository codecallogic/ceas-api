const express = require('express')
const router = express.Router()
const { createComponent, allComponents, allComponentsPublic, updateComponent, deleteComponent } = require('../controller/components')

// MIDDLEWARE
const { adminRequiresLogin } = require('../controller/auth')
const { clearComponentsFromFaculty, clearComponentsFromStudents, clearComponentsFromPublications, clearComponentsFromNews, clearComponentsFromSlides } = require('../controller/clearingData')

router.post('/create-component', adminRequiresLogin, createComponent)
router.get('/all-components', adminRequiresLogin, allComponents)
router.get('/all-components-public', allComponentsPublic)
router.get('/all-components', adminRequiresLogin, allComponents)
router.post('/update-component', adminRequiresLogin, updateComponent)
router.post('/delete-component', adminRequiresLogin, clearComponentsFromFaculty, clearComponentsFromStudents, clearComponentsFromPublications, clearComponentsFromNews, clearComponentsFromSlides, deleteComponent)

module.exports  = router