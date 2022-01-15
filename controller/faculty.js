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
  
    if(req.file) req.body.profileImage = req.file.filename
    
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}

    Faculty.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(found) return res.status(401).json('Faculty with that name already exists')

      const newFaculty = new Faculty(req.body)

      newFaculty.save((err, faculty) => {
        console.log(err)
        if(err) return res.status(401).json('Error ocurred creating new faculty member')

        Faculty.find({}).populate(['componentOne', 'componentTwo', 'componentThree']).exec((err, list) => {
          console.log(err)
          if(err) return res.status(401).json('Faculty member was created, but there was an error loading the faculty data')

          return res.json(list)
        })
        
      })
    })
  })
}

exports.getFaculty = (req, res) => {
  Faculty.find({}).populate(['componentOne', 'componentTwo', 'componentThree']).exec((err, list) => {
    if(err) return res.status(401).json('Error ocurred loading faculty list')
    return res.json(list)
  })
}

exports.updateFaculty = (req, res) => {
  upload(req, res, async (err) => {
  
    if(req.file) await unlinkAsync(`public/faculty/${req.body.previousProfileImage}`)
    if(req.file) req.body.profileImage = req.file.filename
    
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}

    Faculty.findByIdAndUpdate(req.body._id, req.body).exec((err, updated) => {
      console.log(err)
      if(err) return res.status(401).json('Error ocurred updating faculty member')
      
      Faculty.find({}).populate(['componentOne', 'componentTwo', 'componentThree']).exec((err, list) => {

        if(err) return res.status(401).json('Faculty member was updated, but there was an error loading faculty data')
        return res.json(list)

      })
    })
  })
}