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
    
    // for(let key in req.body){ 

    //   if(typeof req.body[key] == 'object'){

    //     if(req.body[key].length > 0){
    //       if(req.body[key][0]._id) req.body[key] = req.body[key][0]._id
    //     }

    //     if(typeof req.body[key] == 'object' && !Array.isArray(req.body[key])){
    //       if(req.body[key]) req.body[key] = req.body[key]._id
    //     }
    //   } 
    // }

    Publication.findOne({title: req.body.title}, (err, found) => {
      console.log(err)
      console.log(found)
      if(found) return res.status(400).json('Error occurred item with that name exists')

      const newPublication = new Publication(req.body)

      newPublication.save((err, response) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred creating item')

        Publication.find({}).populate([{path: 'faculty', select: '-_id'}, {path: 'components', select: '-_id'}]).select(['-_id']).exec((err, list) => {
          console.log(err)
          if(err) return 
          // global.io.emit('publication', list)
          
          Publication.find({}).populate(['faculty', 'components']).exec((err, list) => {
            console.log(err)
            if(err) return res.status(400).json('Item was created, but there was an error table items')
  
            return res.json(list)
          })
          
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

exports.allPublicationsPublic = (req, res) => {
  Publication.find({}).populate([{path: 'faculty', select: '-_id'}, {path: 'components', select: '-_id'}]).select(['-_id']).exec((err, list) => {
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
        console.log('UNLINK ERROR', error)
      }
    }

    for(let key in req.body){ if(req.body[key]) req.body[key] = JSON.parse(req.body[key]) }
    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}
    if(req.file) req.body.file = req.file.filename

    for(let key in req.body){ 

      if(typeof req.body[key] == 'object' && Array.isArray(req.body[key])){

        if(typeof req.body[key][0] == 'object' && req.body[key].length > 0){
          req.body[key] = req.body[key].map((item) => {
            if(item._id) return item._id
            return item
          })
        }
      } 

      // if(typeof req.body[key] == 'object' && !Array.isArray(req.body[key])){
      //   if(req.body[key]) req.body[key] = req.body[key]._id
      // }

    }

    // console.log(req.body)
    
    Publication.findByIdAndUpdate(req.body._id, req.body).exec((err, updated) => {
      console.log(err)
      if(err) return res.status(400).json('Error ocurred updating item')

      Publication.find({}).populate([{path: 'faculty', select: '-_id'}, {path: 'components', select: '-_id'}]).select(['-_id']).exec((err, list) => {
        console.log(err)
        if(err) return 
        // global.io.emit('publication', list)
      
        Publication.find({}).populate(['faculty', 'components']).exec((err, list) => {
          console.log(err)
          if(err) return res.status(400).json('Item was updated, but there was an error loading table items')
          return res.json(list)

        })
      })
    })
  })
}

exports.deletePublication = (req, res) => {
  Publication.findById(req.body.id, async (err, item) => {
    if(err) return res.status(401).json('Error ocurred finding item in records')

    if(item.file){
      try {
        const removeImage = await unlinkAsync(`public/publication/${item.file}`)
      } catch (error) {
        console.log(error)
      }
    }

    Publication.findByIdAndDelete(req.body.id, (err, response) => {
      if(err) return res.status(401).json('Error ocurred deleting item')

      Publication.find({}).populate([{path: 'faculty', select: '-_id'}, {path: 'components', select: '-_id'}]).select(['-_id']).exec((err, list) => {
        console.log(err)
        if(err) return 
        // global.io.emit('publication', list)

        Publication.find({}).populate(['faculty', 'components']).exec((err, list) => {
          if(err) return res.status(401).json('Item was deleted but there was an error loading table items')

          return res.json(list)
          
        })

      })

    })

  })
}
