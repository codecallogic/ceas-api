const NavMenu = require('../models/navMenu')
const NavItem = require('../models/navItem')
const multer = require('multer')

// MULTER UPLOAD
let storage = multer.diskStorage({
  destination: function (req, file, cb){ cb(null, 'public/navigation') },
  filename: function(req, file, cb){ cb(null, file.originalname) }
})

let upload = multer({ storage: storage }).single('file')

exports.allNavMenus = (req, res) => {
  NavMenu.find({}).populate('items').exec((err, list) => {
    console.log(err)
    if(err) res.status(400).json('Error ocurred loading items')
    res.json(list)
  })
}

exports.allNavMenusPublic = (req, res) => {
  NavMenu.find({}).populate({path: 'items', select: '-_id'}).select(['-_id']).exec((err, list) => {
    console.log(err)
    if(err) res.status(500).json('Error ocurred loading items')
    res.json(list)
  })
}

exports.createNavMenu = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    for(let key in req.body){ req.body[key] = JSON.parse(req.body[key]) }
    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}

    for(let key in req.body){ 
      if(typeof req.body[key] == 'object'){

        if(req.body[key].length > 0){
          req.body[key].forEach((item, idx) => {
            req.body[key][idx] = item._id
          })
        }

      } 
    }

    NavMenu.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(found) return res.status(400).json('Error ocurred item with name already exists')

      const newNavMenu = new NavMenu(req.body)

      newNavMenu.save((err, newMenu) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred creating item')

        NavMenu.find({}).populate({path: 'items', select: '-_id'}).select(['-_id']).exec( (err, socketList) => {
          console.log(err)
          if(err) return console.log(err)
          // global.io.emit('navigation', socketList)

          NavMenu.find({}).populate('items').exec( (err, list) => {
          console.log(err)
          
            if(err) return res.status(400).json('Error ocurred loading items')
            return res.json(list)
          })
          
        })
      })
    })

  })
}

exports.updateNavMenu = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    for(let key in req.body){ req.body[key] = JSON.parse(req.body[key]) }
    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}

    for(let key in req.body){ 
      if(typeof req.body[key] == 'object'){

        if(req.body[key].length > 0){
          req.body[key].forEach((item, idx) => {
            req.body[key][idx] = item._id
          })
        }

      } 
    }

    // console.log(req.body)

    NavMenu.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(err) return res.status(400).json('Error occurred, could not find user in records')

      NavMenu.findByIdAndUpdate(req.body._id, req.body, {new: true}, (err, item) => {
        if(err) return res.status(400).json('Error occurred item was not updated')

        NavMenu.find({}).populate({path: 'items', select: '-_id'}).select(['-_id']).exec( (err, socketList) => {
          console.log(err)
          if(err) return console.log(err)
          // global.io.emit('navigation', socketList)

          NavMenu.find({}).populate('items').exec( (err, list) => {
            if(err) return res.status(400).json('Error occurred loading items')
            return res.json(list)
          })
        })
      })
    })

  })
}

exports.deleteNavMenu = (req, res) => {

  NavMenu.findByIdAndDelete(req.body.id, (err, response) => {
    console.log(err)
    if(err) res.status(400).json('Error occurred deleting item')
    NavMenu.find({}).populate({path: 'items', select: '-_id'}).select(['-_id']).exec( (err, socketList) => {
      console.log(err)
      if(err) return console.log(err)
      // global.io.emit('navigation', socketList)

      NavMenu.find({}).populate('items').exec((err, list) => {
        console.log(err)
        if(err) return res.status(400).json('Error occurred loading items')
        return res.json(list)
      })
    })
  })

}

exports.allNavItems = (req, res) => {
  NavItem.find({}).exec((err, list) => {
    console.log(err)
    if(err) res.status(400).json('Error ocurred loading items')
    res.json(list)
  })
}

exports.createNavItem = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    for(let key in req.body){ req.body[key] = JSON.parse(req.body[key]) }

    NavItem.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(found) return res.status(400).json('Error ocurred item with name already exists')

      const newNavItem = new NavItem(req.body)

      newNavItem.save((err, newItem) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred creating item')

        NavMenu.find({}).populate({path: 'items', select: '-_id'}).select(['-_id']).exec( (err, socketList) => {
          console.log(err)
          if(err) return console.log(err)
          // global.io.emit('navigation', socketList)

          NavItem.find({}).exec( (err, list) => {
            console.log(err)
            if(err) return res.status(400).json('Error ocurred loading items')
            return res.json(list)
          })
        })
      })
    })

  })
}

exports.updateNavItem = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    for(let key in req.body){ req.body[key] = JSON.parse(req.body[key]) }

    NavItem.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(err) return res.status(400).json('Error occurred, could not find user in records')

      NavItem.findByIdAndUpdate(req.body._id, req.body, {new: true}, (err, item) => {
        if(err) return res.status(400).json('Error occurred item was not updated')

        NavMenu.find({}).populate({path: 'items', select: '-_id'}).select(['-_id']).exec( (err, socketList) => {
          console.log(err)
          if(err) return console.log(err)
          // global.io.emit('navigation', socketList)

          NavItem.find({}).exec( (err, list) => {
            if(err) return res.status(400).json('Error occurred loading items')
            return res.json(list)
          })

        })
      })
    })

  })
}

exports.deleteNavItem = (req, res) => {

  // console.log(req.body)

  NavItem.findByIdAndDelete(req.body.id, (err, response) => {
    console.log(err)
    if(err) res.status(400).json('Error occurred deleting item')

    NavMenu.find({}).populate({path: 'items', select: '-_id'}).select(['-_id']).exec( (err, socketList) => {
      console.log(err)
      if(err) return console.log(err)
      // global.io.emit('navigation', socketList)

      NavItem.find({}).exec((err, list) => {
        console.log(err)
        if(err) return res.status(400).json('Error occurred loading items')
        return res.json(list)
      })

    })
  })

}