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
  
    if(req.file) req.body.profileImage = req.file.filename
    
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}

    Student.findOne({name: req.body.name}, (err, found) => {
      console.log(err)
      if(found) return res.status(401).json('Student with that name already exists')

      const newStudent = new Student(req.body)

      newStudent.save((err, student) => {
        console.log(err)
        if(err) return res.status(401).json('Error ocurred creating new student')

        Student.find({}).populate(['advisor', 'component']).exec((err, list) => {
          console.log(err)
          if(err) return res.status(401).json('Student was created, but there was an error loading the student data')

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
  
    if(req.file) {
      try {
        const removeImage = await unlinkAsync(`public/student/${req.body.previousProfileImage}`)

      } catch (error) {
        console.log(error)

      }
    }

    if(req.file) req.body.profileImage = req.file.filename
    
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}

    Student.findByIdAndUpdate(req.body._id, req.body).exec((err, updated) => {
      console.log(err)
      if(err) return res.status(401).json('Error ocurred updating student')
      
      Student.find({}).populate(['advisor', 'component']).exec((err, list) => {

        if(err) return res.status(401).json('Student was updated, but there was an error loading student')
        return res.json(list)

      })
    })
  })
}

exports.deleteStudent = (req, res) => {
  Student.findById(req.body.id, async (err, student) => {
    if(err) return res.status(401).json('Error ocurred finding student record')

    if(student){
      try {
        const removeImage =await unlinkAsync(`public/student/${student.profileImage}`)
      } catch (error) {
        console.log(error)
      }
    }

    Student.findByIdAndDelete(req.body.id, (err, response) => {
      if(err) return res.status(401).json('Error ocurred deleting student record')

      Student.find({}).populate(['advisor', 'component']).exec((err, list) => {
        if(err) return res.status(401).json('Student was deleted but there was an error loading table data')

        return res.json(list)
        
      })
      
    })

  })
}