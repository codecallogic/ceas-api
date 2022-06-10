const multer = require('multer')
const Lab = require('../models/labs')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

let storage = multer.diskStorage({
  destination: function (req, file, cb){ cb(null, 'public/labs') },
  filename: function(req, file, cb){ cb(null, file.originalname) }
})

let upload = multer({ storage: storage }).fields([{name: 'file'}, {name: 'icon'}])

exports.createLab = (req, res) => {
  upload(req, res, (err) => {
  
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }
    
    if(req.body.previousImage) delete req.body.previousImage
    if(req.body.previousIcon) delete req.body.previousIcon
    for(let key in req.body){ if(req.body[key]) req.body[key] = JSON.parse(req.body[key]) }
    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}
    if(req.files.file) req.body.image = req.files.file[0].filename
    if(req.files.icon) req.body.icon = req.files.icon[0].filename

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

    console.log(req.body)

    Lab.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(found) return res.status(400).json('Error occurred item with that name exists')

      const newLab = new Lab(req.body)

      newLab.save((err, response) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred creating item')

        Lab.find({}).populate([{path: 'faculty', select: '-_id'}, {path: 'equipment', select: '-_id'}]).select(['-_id']).exec((err, list) => {
          console.log(err)
          if(err) return
          // global.io.emit('labs', list)
      
          Lab.find({}).populate(['faculty', 'equipment']).exec((err, list) => {
            console.log(err)
            if(err) return res.status(400).json('Item was created, but there was an error table items')
  
            return res.json(list)
          })
          
        })
        
      })
    })
  })
}

exports.allLabs = (req, res) => {
  Lab.find({}).populate(['faculty', 'equipment']).exec((err, list) => {
    if(err) return res.status(400).json('Error ocurred loading list items')
    return res.json(list)
  })
}

exports.allLabsPublic = (req, res) => {
  Lab.find({}).populate([{path: 'faculty', select: '-_id'}, {path: 'equipment', select: '-_id'}]).select(['-_id']).exec((err, list) => {
    if(err) return res.status(400).json('Error ocurred loading list items')
    return res.json(list)
  })
}

exports.updateLab = (req, res) => {
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
        const removeImage = await unlinkAsync(`public/labs/${req.body.previousImage}`)
        
      } catch (error) {
        console.log(error)
      }
    }

    if(req.files.icon && req.body.previousIcon) {
      try {
        const removeImage = await unlinkAsync(`public/labs/${req.body.previousIcon}`)
        
      } catch (error) {
        console.log(error)
      }
    }

    for(let key in req.body){ if(req.body[key]) req.body[key] = JSON.parse(req.body[key]) }
    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}
    if(req.files.file) req.body.image = req.files.file[0].filename
    if(req.files.icon) req.body.icon = req.files.icon[0].filename

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

    Lab.findByIdAndUpdate(req.body._id, req.body).exec((err, updated) => {
      console.log(err)
      if(err) return res.status(401).json('Error ocurred updating item')
      
      Lab.find({}).populate([{path: 'faculty', select: '-_id'}, {path: 'equipment', select: '-_id'}]).select(['-_id']).exec((err, list) => {
        console.log(err)
        if(err) return
        // global.io.emit('labs', list)
      
        Lab.find({}).populate(['faculty', 'equipment']).exec((err, list) => {

          if(err) return res.status(401).json('Item was updated, but there was an error loading table items')
          return res.json(list)

        })
      })
    })
  })
}

exports.deleteLab = (req, res) => {
  Lab.findById(req.body.id, async (err, item) => {
    if(err) return res.status(401).json('Error ocurred finding item in records')

    if(item.image){
      try {
        const removeImage = await unlinkAsync(`public/labs/${item.image}`)
      } catch (error) {
        console.log(error)
      }
    }

    if(item.icon){
      try {
        const removeImage = await unlinkAsync(`public/labs/${response.icon}`)
      } catch (error) {
        console.log(error)
      }
    }

    Lab.findByIdAndDelete(req.body.id, (err, response) => {
      if(err) return res.status(401).json('Error ocurred deleting item')

      Lab.find({}).populate([{path: 'faculty', select: '-_id'}, {path: 'equipment', select: '-_id'}]).select(['-_id']).exec((err, list) => {
        console.log(err)
        if(err) return
        // global.io.emit('labs', list)
      
        Lab.find({}).populate(['faculty', 'equipment']).exec((err, list) => {
          if(err) return res.status(401).json('Item was deleted but there was an error loading table items')

          return res.json(list)
          
        })
      })
      
    })

  })
}