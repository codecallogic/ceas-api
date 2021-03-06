const express = require('express')
const router = express.Router()
const {createLab, allLabs, allLabsPublic, updateLab, deleteLab} = require('../controller/labs')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')
const { clearLabsFromEquipment } = require('../controller/clearingData')

router.post('/create-lab', adminRequiresLogin, createLab)
router.get('/all-labs', adminRequiresLogin, allLabs)
router.get('/all-labs-public', allLabsPublic)
router.post('/update-lab', adminRequiresLogin, updateLab)
router.post('/delete-lab', adminRequiresLogin, clearLabsFromEquipment, deleteLab)

module.exports  = router