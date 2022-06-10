const Component = require('../models/component')
const multer = require('multer')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

// MULTER UPLOAD
let storage = multer.diskStorage({
  destination: function (req, file, cb){ cb(null, 'public/component') },
  filename: function(req, file, cb){ cb(null, file.originalname) }
})

let upload = multer({ storage: storage }).fields([{name: 'file'}, {name: 'icon'}])

exports.createComponent = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    if(req.body.previousImage) delete req.body.previousImage
    if(req.body.previousIcon) delete req.body.previousIcon
    for(let key in req.body){ req.body[key] = JSON.parse(req.body[key]) }
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

    Component.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(found) return res.status(400).json('Error ocurred item with name already exists')

      const newComponent = new Component(req.body)

      newComponent.save((err, component) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred creating item')

        Component.find({}).populate({path: 'leader', select: '-_id'}).select(['-_id']).exec( (err, list) => {
          console.log(err)
          if(err) return
          // global.io.emit('components', list)
          
          Component.find({}).populate('leader').exec( (err, list) => {
            console.log(err)
            if(err) return res.status(400).json('Error ocurred loading items')
            return res.json(list)
          })
          
        })

      })
    })
  })
}

exports.allComponents = (req, res) => {
  Component.find({}).populate('leader').exec((err, list) => {
    if(err) res.status(400).json('Error ocurred loading components')
    res.json(list)
  })
}

exports.allComponentsPublic = (req, res) => {
  Component.find({}).populate({path: 'leader', select: '-_id'}).select(['-_id']).exec((err, list) => {
    if(err) res.status(400).json('Error ocurred loading components')
    res.json(list)
  })
}

exports.updateComponent = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    if(req.files.file && req.body.previousImage) {
      try {
        const removeImage = await unlinkAsync(`public/component/${req.body.previousImage}`)
        
      } catch (error) {
        console.log(error)
      }
    }

    if(req.files.icon && req.body.previousIcon) {
      try {
        const removeImage = await unlinkAsync(`public/component/${req.body.previousIcon}`)
        
      } catch (error) {
        console.log(error)
      }
    }

    for(let key in req.body){ req.body[key] = JSON.parse(req.body[key]) }
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

    Component.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(err) return res.status(400).json('Error occurred, could not find user in records')

      Component.findByIdAndUpdate(req.body._id, req.body, {new: true}, (err, item) => {
        if(err) return res.status(401).json('Error occurred item was not updated')

        Component.find({}).populate({path: 'leader', select: '-_id'}).select(['-_id']).exec( (err, list) => {
          console.log(err)
          if(err) return
          // global.io.emit('components', list)
          
          Component.find({}).populate('leader').exec( (err, list) => {
            console.log(err)
            if(err) return res.status(400).json('Error ocurred loading items')
            return res.json(list)
          })
          
        })
        
      })
    })

  })
}

exports.deleteComponent = (req, res) => {
  Component.findByIdAndDelete(req.body.id, async (err, response) => {
    console.log(err)
    if(err) res.status(400).json('Error occurred deleting item')

    if(response.image){
      try {
        const removeImage = await unlinkAsync(`public/component/${response.image}`)
      } catch (error) {
        console.log(error)
      }
    }

    if(response.icon){
      try {
        const removeImage = await unlinkAsync(`public/component/${response.icon}`)
      } catch (error) {
        console.log(error)
      }
    }

    Component.find({}).populate({path: 'leader', select: '-_id'}).select(['-_id']).exec( (err, list) => {
      console.log(err)
      if(err) return
      // global.io.emit('components', list)
      
      Component.find({}).populate('leader').exec( (err, list) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred loading items')
        return res.json(list)
      })
      
    })

  })
}