const express = require('express')
const router = express.Router()
const {createEquipment, allEquipment, allEquipmentPublic, updateEquipment, deleteEquipment} = require('../controller/equipment')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')
// const { clearFacultyFromComponents, clearFacultyFromStudents } = require('../controller/clearingData')

router.post('/create-equipment', adminRequiresLogin, createEquipment)
router.get('/all-equipment', adminRequiresLogin, allEquipment)
router.get('/all-equipment-public', allEquipmentPublic)
router.post('/update-equipment', adminRequiresLogin, updateEquipment)
router.post('/delete-equipment', adminRequiresLogin, deleteEquipment)

module.exports  = router