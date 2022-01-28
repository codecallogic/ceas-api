const multer = require('multer')
const Form = require('../models/forms')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

let storage = multer.diskStorage({
  destination: function (req, file, cb){ cb(null, 'public/forms') },
  filename: function(req, file, cb){ cb(null, file.originalname) }
})

let upload = multer({ storage: storage }).single('file')

exports.createForm = (req, res) => {
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


    Form.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(found) return res.status(400).json('Error occurred item with that name exists')

      const newForm = new Form(req.body)

      newForm.save((err, response) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred creating item')

        Form.find({}).exec((err, list) => {
          console.log(err)
          if(err) return res.status(400).json('Item was created, but there was an error table items')

          return res.json(list)
        })
        
      })
    })
  })
}

exports.allForms = (req, res) => {
  Form.find({}).exec((err, list) => {
    if(err) return res.status(401).json('Error ocurred loading list items')
    return res.json(list)
  })
}

exports.updateForm = (req, res) => {
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
        const removeImage = await unlinkAsync(`public/forms/${req.body.previousFile}`)
        
      } catch (error) {
        console.log(error)
      }
    }

    for(let key in req.body){ if(req.body[key]) req.body[key] = JSON.parse(req.body[key]) }
    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}
    if(req.file) req.body.file = req.file.filename

    Form.findByIdAndUpdate(req.body._id, req.body).exec((err, updated) => {
      console.log(err)
      if(err) return res.status(400).json('Error ocurred updating item')
      
      Form.find({}).exec((err, list) => {

        if(err) return res.status(400).json('Item was updated, but there was an error loading table items')
        return res.json(list)

      })
    })
  })
}

exports.deleteForm = (req, res) => {
  Form.findById(req.body.id, async (err, item) => {
    if(err) return res.status(400).json('Error ocurred finding item in records')

    if(item.file){
      try {
        const removeImage = await unlinkAsync(`public/forms/${item.file}`)
      } catch (error) {
        console.log(error)
      }
    }

    Form.findByIdAndDelete(req.body.id, (err, response) => {
      if(err) return res.status(401).json('Error ocurred deleting item')

      Form.find({}).exec((err, list) => {
        if(err) return res.status(401).json('Item was deleted but there was an error loading table items')

        return res.json(list)
        
      })
      
    })

  })
}