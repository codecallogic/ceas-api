const express = require('express')
const router = express.Router()
const {createAdmin, adminLogin, adminRequiresLogin, readAdmin, updateAdmin, sendChangeAdminEmail, adminUpdateEmail} = require('../controller/auth')

// MIDDLEWARE
const {adminLoginValidator} = require('../validators/auth')
const {runValidation} = require('../validators')

router.post('/create-admin', createAdmin)
router.post('/login', adminLoginValidator, runValidation, adminLogin)
router.get('/admin', adminRequiresLogin, readAdmin)
router.post('/update-admin-profile', adminRequiresLogin, updateAdmin)
router.post('/send-change-admin-email', adminRequiresLogin, sendChangeAdminEmail)
router.post('/update-admin-email', adminUpdateEmail)

module.exports  = router