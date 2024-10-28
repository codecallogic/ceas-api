const Publication = require('../models/publication')
const multer = require('multer')
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
      cb(null, `publication/${Date.now().toString()}-${file.originalname}`)
    }
  })
}).fields([{ name: 'file' }, { name: 'icon' }])

const S3aws = new aws.S3()

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
    if(req.files.file) req.body.file = req.files.file[0].location


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

    // Parse req.body fields only if they are JSON strings
    for(let key in req.body){ req.body[key] = JSON.parse(req.body[key]) }
    
    if(req.files.file && req.body.previousFile) {
      
      let location = req.body.previousFile.split("/publication")[1]
      
      location = 'publication' + location
      
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
    if(req.files.file) req.body.file = req.files.file[0].location

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
    
    Publication.findByIdAndUpdate(req.body._id, req.body).exec((err, updated) => {
      console.log(err)
      if(err) return res.status(400).json('Error ocurred updating item')
      console.log(updated)

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
    
      let location = item.file.split("/publication")[1]
      console.log('LOCATION IMAGE', location)
      location = 'publication' + location
      
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
