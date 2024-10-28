const multer = require('multer')
const Slide = require('../models/slides')
const { S3 } = require('@aws-sdk/client-s3')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')

// Configure AWS SDK
const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
})

// S3 delete config
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

// MULTER S3 STORAGE
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `slides/${Date.now().toString()}-${file.originalname}`)
    }
  })
}).fields([{ name: 'file' }, { name: 'icon' }])

const S3aws = new aws.S3()

exports.createSlide = (req, res) => {
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
    if(req.files.file) req.body.image = req.files.file[0].location

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


    Slide.findOne({caption: req.body.caption}, (err, found) => {
      console.log(err)
      if(found) return res.status(400).json('Error occurred item with that name exists')

      const newSlide = new Slide(req.body)

      newSlide.save((err, response) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred creating item')

        Slide.find({}).populate({path: 'component', select: '-_id'}).select(['-_id']).exec((err, list) => {
          console.log(err)
          if(err) return
          // global.io.emit('slides', list)

          Slide.find({}).populate(['component']).exec((err, list) => {
            console.log(err)
            if(err) return res.status(400).json('Item was created, but there was an error table items')
  
            return res.json(list)
          })
          
        })        
      })
    })
  })
}

exports.allSlides = (req, res) => {
  Slide.find({}).populate(['component']).exec((err, list) => {
    if(err) return res.status(401).json('Error ocurred loading list items')
    return res.json(list)
  })
}

exports.allSlidesPublic = (req, res) => {
  Slide.find({}).populate({path: 'component', select: '-_id'}).select(['-_id']).exec((err, list) => {
    if(err) return res.status(401).json('Error ocurred loading list items')
    return res.json(list)
  })
}

exports.updateSlide = (req, res) => {
  upload(req, res, async (err) => {
    
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }
    
    // Parse req.body fields only if they are JSON strings
    for(let key in req.body){ req.body[key] = JSON.parse(req.body[key]) }
    
    if(req.files.file && req.body.previousImage) {
      
      let location = req.body.previousImage.split("/slides")[1]
      
      location = 'slides' + location
      
      let params = {
        Bucket: 'catsus', 
        Key: location
      }
      
      try {
        
        S3aws.deleteObject(params, (err, data) => {
          console.log(err)
          if (err) return { message: err }
        })
        
      } catch (error) {
        console.log(error)
      }
      
    }

    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}
    if(req.files.file) req.body.image = req.files.file[0].location

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

    Slide.findByIdAndUpdate(req.body._id, req.body).exec((err, updated) => {
      console.log(err)
      if(err) return res.status(401).json('Error ocurred updating item')

      Slide.find({}).populate({path: 'component', select: '-_id'}).select(['-_id']).exec((err, list) => {
        console.log(err)
        if(err) return
        // global.io.emit('slides', list)

        Slide.find({}).populate(['component']).exec((err, list) => {

          if(err) return res.status(401).json('Item was updated, but there was an error loading table items')
          return res.json(list)
  
        })
        
      })

    })
  })
}

exports.deleteSlide = (req, res) => {
  Slide.findById(req.body.id, async (err, item) => {
    if(err) return res.status(401).json('Error ocurred finding item in records')

    if(item.image){
    
      let location = item.image.split("/slides")[1]
      console.log('LOCATION IMAGE', location)
      location = 'slides' + location
      
      let params = {
        Bucket: 'catsus', 
        Key: location
      }
      
      try {
        
        S3aws.deleteObject(params, (err, data) => {
          console.log(err)
          if (err) return { message: err }
        })
        
      } catch (error) {
        console.log(error)
      }
      
    }

    Slide.findByIdAndDelete(req.body.id, (err, response) => {
      if(err) return res.status(401).json('Error ocurred deleting item')

      Slide.find({}).populate({path: 'component', select: '-_id'}).select(['-_id']).exec((err, list) => {
        console.log(err)
        if(err) return
        // global.io.emit('slides', list)

        Slide.find({}).populate(['component']).exec((err, list) => {
          if(err) return res.status(401).json('Item was deleted but there was an error loading table items')
  
          return res.json(list)
          
        })
        
      })
      
    })

  })
}