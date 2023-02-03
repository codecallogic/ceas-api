const express = require('express')
const router = express.Router()
const { inviteAdmin, activateAdmin, adminLogin, adminRequiresLogin, authorizedOnly, readAdmin, updateAdmin, sendChangeAdminEmail, adminUpdateEmail, forgotPassword, resetPassword, logout } = require('../controller/auth')

// GET ALL
const { allAdmin } = require('../controller/auth')

// ADMIN USERS CRUD 
const { deleteAdmin } = require('../controller/auth')

// MIDDLEWARE
const { adminLoginValidator, resetPasswordValidator } = require('../validators/auth')
const { runValidation } = require('../validators')

router.post('/invite-admin', adminRequiresLogin, inviteAdmin)
router.post('/activate-admin', activateAdmin)
router.post('/login', adminLoginValidator, runValidation, adminLogin)
router.get('/admin', adminRequiresLogin, readAdmin)
router.post('/update-admin-profile', adminRequiresLogin, updateAdmin)
router.post('/send-change-admin-email', adminRequiresLogin, sendChangeAdminEmail)
router.post('/update-admin-email',  adminRequiresLogin, adminUpdateEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPasswordValidator, runValidation, resetPassword)
router.post('/logout', logout)

// GET ALL
router.get('/all-admin', adminRequiresLogin, allAdmin)

// ADMIN USERS CRUD
router.post('/delete-admin', adminRequiresLogin, authorizedOnly, deleteAdmin)

module.exports  = router