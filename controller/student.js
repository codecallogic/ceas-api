const multer = require('multer')
const Student = require('../models/student')
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

let storage = multer.diskStorage({
  destination: function (req, file, cb){ cb(null, 'public/student') },
  filename: function(req, file, cb){ cb(null, file.originalname) }
})

let upload = multer({ storage: storage }).single('file')

exports.createStudent = (req, res) => {
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

    if(req.file) req.body.image = req.file.filename

    Student.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(found) return res.status(401).json('Error occurred item with that name exists')

      const newStudent = new Student(req.body)

      newStudent.save((err, student) => {
        console.log(err)
        if(err) return res.status(401).json('Error ocurred creating item')

        Student.find({}).populate(['advisor', 'component']).exec((err, list) => {
          console.log(err)
          if(err) return res.status(401).json('Item was created, but there was an error loading the student data')

          return res.json(list)
        })
        
      })
    })
  })
}

exports.getStudents = (req, res) => {
  Student.find({}).populate(['advisor', 'component']).exec((err, list) => {
    if(err) return res.status(401).json('Error ocurred loading student list')
    return res.json(list)
  })
}

exports.updateStudent = (req, res) => {
  upload(req, res, async (err) => {
  
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }
    
    if(req.file) {
      try {
        const removeImage = await unlinkAsync(`public/student/${req.body.previousImage}`)
        
      } catch (error) {
        console.log(error)
      }
    }

    if(req.file) req.body.image = req.file.filename
    for(let key in req.body){ if(req.body[key]) req.body[key] = JSON.parse(req.body[key]) }
    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}

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

    Student.findByIdAndUpdate(req.body._id, req.body).exec((err, updated) => {
      console.log(err)
      if(err) return res.status(401).json('Error ocurred updating item')
      
      Student.find({}).populate(['advisor', 'component']).exec((err, list) => {

        if(err) return res.status(401).json('Item was updated, but there was an error loading table items')
        return res.json(list)

      })
    })
  })
}

exports.deleteStudent = (req, res) => {
  Student.findById(req.body.id, async (err, student) => {
    if(err) return res.status(401).json('Error ocurred finding item record')

    if(student){
      try {
        const removeImage =await unlinkAsync(`public/student/${student.image}`)
      } catch (error) {
        console.log(error)
      }
    }

    Student.findByIdAndDelete(req.body.id, (err, response) => {
      if(err) return res.status(401).json('Error ocurred deleting item')

      Student.find({}).populate(['advisor', 'component']).exec((err, list) => {
        if(err) return res.status(401).json('Item was deleted but there was an error loading table items')

        return res.json(list)
        
      })
      
    })

  })
}