const express = require('express')
const router = express.Router()
const {createAdmin, adminLogin, adminRequiresLogin, readAdmin} = require('../controller/auth')

// MIDDLEWARE
const {adminLoginValidator} = require('../validators/auth')
const {runValidation} = require('../validators')

router.post('/create-admin', createAdmin)
router.post('/login', adminLoginValidator, runValidation, adminLogin)
router.get('/admin', adminRequiresLogin, readAdmin)

module.exports  = router