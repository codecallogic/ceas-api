const express = require('express')
const router = express.Router()
const {createNews, allNews, updateNews, deleteNews} = require('../controller/news')

// MIDDLEWARE
const {adminRequiresLogin} = require('../controller/auth')
// const { clearFacultyFromComponents, clearFacultyFromStudents } = require('../controller/clearingData')

router.post('/create-news', adminRequiresLogin, createNews)
router.get('/all-news', adminRequiresLogin, allNews)
router.post('/update-news', adminRequiresLogin, updateNews)
router.post('/delete-news', adminRequiresLogin, deleteNews)

module.exports  = router