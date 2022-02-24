const express = require('express')
const router = express.Router()

//// NAV MENUS
const { allNavMenus, createNavMenu, updateNavMenu, deleteNavMenu } = require('../controller/navigation')

//// NAV ITEMS
const { allNavItems, createNavItem, updateNavItem, deleteNavItem } = require('../controller/navigation')

//// MIDDLEWARE
const { adminRequiresLogin } = require('../controller/auth')
const { clearNavItemsFromNavMenu } = require('../controller/clearingData')

//// NAV MENUS
router.get('/all-nav-menus', adminRequiresLogin, allNavMenus)
router.post('/create-nav-menu', adminRequiresLogin, createNavMenu)
router.post('/update-nav-menu', adminRequiresLogin, updateNavMenu)
router.post('/delete-nav-menu', adminRequiresLogin, deleteNavMenu)

//// NAV ITEMS
router.get('/all-nav-items', adminRequiresLogin, allNavItems)
router.post('/create-nav-item', adminRequiresLogin, createNavItem)
router.post('/update-nav-item', adminRequiresLogin, updateNavItem)
router.post('/delete-nav-item', adminRequiresLogin, clearNavItemsFromNavMenu, deleteNavItem)

module.exports  = router