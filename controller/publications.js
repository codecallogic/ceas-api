const Publication = require('../models/publication')
const multer = require('multer')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

let storage = multer.diskStorage({
  destination: function (req, file, cb){ cb(null, 'public/publication') },
  filename: function(req, file, cb){ cb(null, file.originalname) }
})

let upload = multer({ storage: storage }).single('file')

exports.createPublication = (req, res) => {
  upload(req, res, (err) => {
  
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }
    
    if(req.body.previousFile) delete req.body.previousFile
    for(let key in req.body){ if(req.body[key]) req.body[key] = JSON.parse(req.body[key]) }
    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}
    if(req.file) req.body.file = req.file.filename
    
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


    Publication.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(found) return res.status(400).json('Error occurred item with that name exists')

      const newPublication = new Publication(req.body)

      newPublication.save((err, response) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred creating item')

        Publication.find({}).populate(['faculty', 'components']).exec((err, list) => {
          console.log(err)
          if(err) return res.status(400).json('Item was created, but there was an error table items')

          return res.json(list)
        })
        
      })
    })
  })
}

exports.allPublications = (req, res) => {
  Publication.find({}).populate(['faculty', 'components']).exec((err, list) => {
    if(err) return res.status(401).json('Error ocurred loading list items')
    return res.json(list)
  })
}

exports.updatePublication = (req, res) => {
  upload(req, res, async (err) => {
    
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }
    
    if(req.file && req.body.previousFile) {
      try {
        const removeImage = await unlinkAsync(`public/publication/${req.body.previousFile}`)
        
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

    Publication.findByIdAndUpdate(req.body._id, req.body).exec((err, updated) => {
      console.log(err)
      if(err) return res.status(401).json('Error ocurred updating item')
      
      Publication.find({}).populate(['faculty', 'component']).exec((err, list) => {

        if(err) return res.status(401).json('Item was updated, but there was an error loading table items')
        return res.json(list)

      })
    })
  })
}
