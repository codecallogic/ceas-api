const express = require('express')
const router = express.Router()
const {createForm, allForms, updateForm, deleteForm} = require('../controller/forms')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')

router.post('/create-form', adminRequiresLogin, createForm)
router.get('/all-forms', adminRequiresLogin, allForms)
router.post('/update-form', adminRequiresLogin, updateForm)
router.post('/delete-form', adminRequiresLogin, deleteForm)

module.exports  = router