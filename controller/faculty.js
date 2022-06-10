const multer = require('multer')
const Faculty = require('../models/faculty')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

let storage = multer.diskStorage({
  destination: function (req, file, cb){ cb(null, 'public/faculty') },
  filename: function(req, file, cb){ cb(null, file.originalname) }
})

let upload = multer({ storage: storage }).single('file')

exports.createFaculty = (req, res) => {
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


    Faculty.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(found) return res.status(400).json('Error occurred item with that name exists')

      const newFaculty = new Faculty(req.body)

      newFaculty.save((err, response) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred creating item')

        Faculty.find({}).populate([{path: 'componentOne', select: '-_id'}, {path: 'componentTwo', select: '-_id'}, {path: 'componentThree', select: '-_id'}]).select(['-_id']).exec((err, list) => {
          if(err) return
          // global.io.emit('faculty', list)

          Faculty.find({}).populate(['componentOne', 'componentTwo', 'componentThree']).exec((err, list) => {
            console.log(err)
            if(err) return res.status(400).json('Item was created, but there was an error table items')
  
            return res.json(list)
          })
          
        })
        
      })
    })
  })
}

exports.getFaculty = (req, res) => {
  Faculty.find({}).populate(['componentOne', 'componentTwo', 'componentThree']).exec((err, list) => {
    if(err) return res.status(400).json('Error ocurred loading list items')
    return res.json(list)
  })
}

exports.getFacultyPublic = (req, res) => {
  Faculty.find({}).populate([{path: 'componentOne', select: '-_id'}, {path: 'componentTwo', select: '-_id'}, {path: 'componentThree', select: '-_id'}]).select(['-_id']).exec((err, list) => {
    if(err) return res.status(400).json('Error ocurred loading list items')
    return res.json(list)
  })
}

exports.updateFaculty = (req, res) => {
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
        const removeImage = await unlinkAsync(`public/faculty/${req.body.previousImage}`)
        
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

    Faculty.findByIdAndUpdate(req.body._id, req.body).exec((err, updated) => {
      console.log(err)
      if(err) return res.status(400).json('Error ocurred updating item')

      Faculty.find({}).populate([{path: 'componentOne', select: '-_id'}, {path: 'componentTwo', select: '-_id'}, {path: 'componentThree', select: '-_id'}]).select(['-_id']).exec((err, list) => {
        if(err) return
        // global.io.emit('faculty', list)
      
        Faculty.find({}).populate(['componentOne', 'componentTwo', 'componentThree']).exec((err, list) => {

          if(err) return res.status(400).json('Item was updated, but there was an error loading table items')
          return res.json(list)

        })
      })
    })
  })
}

exports.deleteFaculty = (req, res) => {
  Faculty.findById(req.body.id, async (err, item) => {
    if(err) return res.status(400).json('Error ocurred finding item in records')

    if(item.image){
      try {
        const removeImage = await unlinkAsync(`public/faculty/${item.image}`)
      } catch (error) {
        console.log(error)
      }
    }

    Faculty.findByIdAndDelete(req.body.id, (err, response) => {
      if(err) return res.status(400).json('Error ocurred deleting item')

      Faculty.find({}).populate([{path: 'componentOne', select: '-_id'}, {path: 'componentTwo', select: '-_id'}, {path: 'componentThree', select: '-_id'}]).select(['-_id']).exec((err, list) => {
        if(err) return
        // global.io.emit('faculty', list)

        Faculty.find({}).populate(['componentOne', 'componentTwo', 'componentThree']).exec((err, list) => {
          if(err) return res.status(400).json('Item was deleted but there was an error loading table items')

          return res.json(list)
          
        })
      })
    })

  })
}