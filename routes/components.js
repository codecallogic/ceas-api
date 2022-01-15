const express = require('express')
const router = express.Router()
const {createComponent, allComponents, updateComponent, deleteComponent} = require('../controller/components')

// MIDDLEWARE
const {adminRequiresLogin, checkTokenExpiration} = require('../controller/auth')

router.post('/create-component', adminRequiresLogin, checkTokenExpiration, createComponent)

router.get('/all-components', adminRequiresLogin, allComponents)
router.post('/update-component', adminRequiresLogin, updateComponent)
router.post('/delete-component', adminRequiresLogin, deleteComponent)

module.exports  = router