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
          // global.io.emit('section', list)

          Section.find({}).exec((err, list) => {

            if(err) return res.status(400).json('Item was updated, but there was an error loading table items')
            return res.json(list)
  
          })
        })
        
      })
    })
  })
}

exports.updateSection = (req, res) => {
  upload(req, res, async (err) => {
    
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }
    
    if(req.file && req.body.previousImage) {
      try {
        const removeImage = await unlinkAsync(`public/equipment/${req.body.previousImage}`)
        
      } catch (error) {
        console.log(error)
      }
    }

    for(let key in req.body){ if(req.body[key]) req.body[key] = JSON.parse(req.body[key]) }
    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}
    if(req.file) req.body.image = req.file.filename
    
    Section.findByIdAndUpdate(req.body._id, req.body).exec((err, updated) => {
      console.log(err)
      if(err) return res.status(400).json('Error ocurred updating item')

      Section.find({}).select(['-_id']).exec((err, list) => {
        console.log(err)
        if(err) return 
        // global.io.emit('section', list)

        Section.find({}).exec( (err, list) => {

          if(err) return res.status(400).json('Item was updated, but there was an error loading table items')
          return res.json(list)

        })

      })
    })
  })
}

exports.allSections = (req, res) => {
  Section.find({}).exec((err, list) => {
    if(err) return res.status(400).json('Error ocurred loading list items')
    return res.json(list)
  })
}

exports.allSectionsPublic = (req, res) => {
  Section.find({}).select(['-_id']).exec((err, list) => {
    if(err) return res.status(400).json('Error ocurred loading list items')
    return res.json(list)
  })
}

exports.deleteSection = (req, res) => {

  Section.findById(req.body.id, async (err, item) => {
    if(err) return res.status(400).json('Error ocurred finding item in records')

    if(item.image){
      try {
        const removeImage = await unlinkAsync(`public/section/${item.image}`)
      } catch (error) {
        console.log(error)
      }
    }

    Section.findByIdAndDelete(req.body.id, (err, response) => {
      if(err) return res.status(400).json('Error ocurred deleting item')

      Section.find({}).select(['-_id']).exec((err, list) => {
        console.log(err)
        if(err) return 
        // global.io.emit('section', list)

        Section.find({}).exec((err, list) => {
          if(err) return res.status(400).json('Item was deleted but there was an error loading table items')

          return res.json(list)
          
        })
      })
      
    })

  })
}