const Component = require('../models/component')
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
      cb(null, `components/${Date.now().toString()}-${file.originalname}`)
    }
  })
}).fields([{ name: 'file' }, { name: 'icon' }])

const S3aws = new aws.S3()

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
    for(let key in req.body){ req.body[key] = JSON.parse(req.body[key]) }
    for(let key in req.body){ if(!req.body[key]) delete req.body[key]}
    if(req.files.file) req.body.image = req.files.file[0].location
    if(req.files.icon) req.body.icon = req.files.icon[0].location
    
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

      const newComponent = new Component( req.body )

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
    if (err instanceof multer.MulterError || err) {
      console.log(err)
      return res.status(500).json(err)
    }

    // Parse req.body fields only if they are JSON strings
    for(let key in req.body){ req.body[key] = JSON.parse(req.body[key]) }

    if(req.files.file && req.body.previousImage) {
      
      let location = req.body.previousImage.split("/components")[1]
      
      location = 'components' + location
      
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

    if(req.files.icon && req.body.previousIcon) {

      let location = req.body.previousIcon.split("/components")[1]
      
      location = 'components' + location

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
    if(req.files.icon) req.body.icon = req.files.icon[0].location

    // Simplify object ID parsing if required
    for (let key in req.body) {
      if (typeof req.body[key] === 'object') {
        if (req.body[key].length > 0 && req.body[key][0]._id) {
          req.body[key] = req.body[key][0]._id
        } else if (req.body[key] && !Array.isArray(req.body[key])) {
          req.body[key] = req.body[key]._id
        }
      }
    }

    // Find and update the component
    Component.findByIdAndUpdate(req.body._id, req.body, { new: true }, (err, item) => {
      if (err) return res.status(401).json('Error occurred; item was not updated')

      console.log("Updated item:", item)

      // Return the updated component list
      Component.find({}).populate({ path: 'leader', select: '-_id' }).select(['-_id']).exec((err, list) => {
        if (err) return
        Component.find({}).populate('leader').exec((err, list) => {
          if (err) return res.status(400).json('Error occurred loading items')
          return res.json(list)
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
      
      let location = response.image.split("/components")[1]
      console.log('LOCATION IMAGE', location)
      location = 'components' + location
      
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

    if(response.icon){
      
      let location = response.icon.split("/components")[1]
      console.log('LOCATION ICON', location)
      location = 'components' + location

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