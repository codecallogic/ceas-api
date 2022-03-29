const multer = require('multer')
const Section = require('../models/sections')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

let storage = multer.diskStorage({
  destination: function (req, file, cb){ cb(null, 'public/section') },
  filename: function(req, file, cb){ cb(null, file.originalname) }
})

let upload = multer({ storage: storage }).single('file')

exports.createSection = (req, res) => {
  upload(req, res, (err) => {
  
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }
    
    if(req.body.previousImage) delete req.body.previousImage
    for(let key in req.body){ if(req.body[key]) req.body[key] = JSON.parse(req.body[key]) }
    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}
    if(req.file) req.body.image = req.file.filename
    console.log(req.body)
    Section.findOne({$and: [{path: req.body.path}, {order: req.body.order}]}, (err, found) => {
      console.log(err)
      if(err) return res.status(403).json('Error occurred validating data')
      if(found) return res.status(403).json('Error occurred item with that path and order exists')
      const newSection = new Section(req.body)

      newSection.save((err, response) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred creating item')

        Section.find({}).select(['-_id']).exec((err, list) => {
          console.log(err)
          if(err) return 
          global.io.emit('section', list)
          return res.json(list)
      
        })
        
      })
    })
  })
}

exports.allSections = (req, res) => {
  Section.find({}).select(['-_id']).exec((err, list) => {
    if(err) return res.status(400).json('Error ocurred loading list items')
    return res.json(list)
  })
}