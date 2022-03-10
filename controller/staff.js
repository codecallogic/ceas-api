const Staff = require('../models/staff')
const multer = require('multer')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

let storage = multer.diskStorage({
  destination: function (req, file, cb){ cb(null, 'public/staff') },
  filename: function(req, file, cb){ cb(null, file.originalname) }
})

let upload = multer({ storage: storage }).single('file')

exports.createStaff = (req, res) => {
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
    
    for(let key in req.body){ 

      if(typeof req.body[key] == 'object'){

        if(req.body[key].length > 0){
          if(req.body[key][0]._id) req.body[key] = req.body[key][0]._id
        }

        if(typeof req.body[key] == 'object' && !Array.isArray(req.body[key])){
          if(req.body[key]) req.body[key] = req.body[key]._id
        }
      } 
    }


    Staff.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(found) return res.status(400).json('Error occurred item with that name exists')

      const newStaff = new Staff(req.body)

      newStaff.save((err, response) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred creating item')

        Staff.find({}).exec((err, list) => {
          console.log(err)
          if(err) return res.status(400).json('Item was created, but there was an error table items')
          global.io.emit('staff', list)
          return res.json(list)
        })
        
      })
    })
  })
}

exports.allStaff = (req, res) => {
  Staff.find({}).exec((err, list) => {
    if(err) return res.status(401).json('Error ocurred loading list items')
    return res.json(list)
  })
}

exports.updateStaff = (req, res) => {
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
        const removeImage = await unlinkAsync(`public/staff/${req.body.previousImage}`)
        
      } catch (error) {
        console.log(error)
      }
    }
    
    for(let key in req.body){ if(req.body[key]) req.body[key] = JSON.parse(req.body[key]) }
    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}
    if(req.file) req.body.image = req.file.filename

    for(let key in req.body){ 

      if(typeof req.body[key] == 'object'){

        if(req.body[key].length > 0){
          if(req.body[key][0]._id) req.body[key] = req.body[key][0]._id
        }

        if(typeof req.body[key] == 'object' && !Array.isArray(req.body[key])){
          if(req.body[key]) req.body[key] = req.body[key]._id
        }
      } 
    }

    
    Staff.findByIdAndUpdate(req.body._id, req.body).exec((err, updated) => {
      console.log(err)
      if(err) return res.status(401).json('Error ocurred updating item')
      
      Staff.find({}).exec((err, list) => {
        global.io.emit('staff', list)
        if(err) return res.status(401).json('Item was updated, but there was an error loading table items')
        return res.json(list)

      })
    })

  })
}

exports.deleteStaff = (req, res) => {
  Staff.findById(req.body.id, async (err, item) => {
    if(err) return res.status(401).json('Error ocurred finding item in records')

    if(item.image){
      try {
        const removeImage = await unlinkAsync(`public/staff/${item.image}`)
      } catch (error) {
        console.log(error)
      }
    }

    Staff.findByIdAndDelete(req.body.id, (err, response) => {
      if(err) return res.status(401).json('Error ocurred deleting item')

      Staff.find({}).exec((err, list) => {
        if(err) return res.status(401).json('Item was deleted but there was an error loading table items')
        global.io.emit('staff', list)
        return res.json(list)
        
      })
      
    })

  })
}