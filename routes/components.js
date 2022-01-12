const express = require('express')
const router = express.Router()
const {createComponent, allComponents, updateComponent, deleteComponent} = require('../controller/components')

router.post('/create-component', createComponent)
router.get('/all-components', allComponents)
router.post('/update-component', updateComponent)
router.post('/delete-component', deleteComponent)

module.exports  = router