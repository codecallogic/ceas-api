const User = require('../models/auth')
const jwtMethod = require('jsonwebtoken')
const aws = require('aws-sdk')
const { generatePassword } = require('../helpers/auth')
const { expressjwt: jwt } = require("express-jwt")
const multer = require('multer')

// MULTER UPLOAD
let storage = multer.diskStorage({
  destination: function (req, file, cb){ cb(null, 'public/adminUser') },
  filename: function(req, file, cb){ cb(null, file.originalname) }
})

let upload = multer({ storage: storage }).single('file')

// EMAIL TEMPLATES
const { changeEmailTemplate } = require('../templates/changeEmail')
const { inviteAdmin } = require('../templates/inviteAdmin')
const { forgotPasswordTemplate } = require('../templates/forgotPassword')

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

const ses = new aws.SES({ apiVersion: '2010-12-01'})

exports.inviteAdmin = (req, res) => {

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    for(let key in req.body){ req.body[key] = JSON.parse(req.body[key]) }

    let password = await generatePassword()
    req.body.password = password
    // console.log('INVITE ADMIN', req.body)

    User.findOne({username: req.body.username, email: req.body.email}, (err, user) => {
      console.log(err)
      if(user) return res.status(400).json('Error ocurred, username or email exists.')
      
      const token = jwtMethod.sign(req.body, process.env.JWT_INVITATION_SECRET, {expiresIn: '24hr'})

      const params = inviteAdmin(req.body.email, token, req.body.firstName, req.body.username, req.body.password)
      
      const sendEmail = ses.sendEmail(params).promise()

      sendEmail.then(data => {
        console.log('EMAIL SENT', data)
       
        User.find({}).select(['-password']).exec((err, list) => {
          if(err) return res.status(400).json(`Error ocurred loading items`)
          return res.json(list)
        })
        
      }).catch( err => {
        console.log('EMAIL ERROR', err)
        return res.status(400).json('We could not verify your email address, please try again')
      })
      
    })
    
  })
}

exports.activateAdmin = (req, res) => {

  jwtMethod.verify(req.body.token, process.env.JWT_INVITATION_SECRET, function(err, decoded){
    if(err){
      console.log(err)
      return res.status(400).json('This url has expired, please try again later.')
    }

    User.findOne({$or: [{username: decoded.username}, {email: decoded.email}]}, (err, found) => {
      console.log(err)
      if(found){
        return res.status(400).json('Error occurred, username or email exists.')
      }

      const newAdmin = new User(decoded)
      newAdmin.save((err, admin) => {
        if(err){
          console.log(err)
          return res.status(400).json('Could not activate account, please try again later')
        }

        if(admin){
          const token = jwtMethod.sign({id: admin._id, role: admin.role}, process.env.JWT_SECRET_LOGIN, {expiresIn: '60min', algorithm: 'HS256'})
          const {_id, username, email, role} = admin
          const userAdmin = {_id, username, email, role}

          return res.status(202).cookie(
              "accessTokenAdmin", token, {
              sameSite: 'strict',
              expires: new Date(new Date().getTime() + (60 * 60 * 1000)),
              httpOnly: true,
              secure: false,
              overwrite: true
          })
          .cookie("userAdmin", JSON.stringify(userAdmin), {
            sameSite: 'strict',
            expires: new Date(new Date().getTime() + (60 * 60 * 1000)),
            httpOnly: true,
            secure: false,
            overwrite: true
          })
          .send('User is logged in')
        }
      })
    })
  
  })

}

exports.adminLogin = async (req, res) => {

  User.findOne({$or: [{username: req.body.username}, {email: req.body.username}]}, (err, user) => {
    console.log('ERROR', err)
    if(err || !user) return res.status(401).json('Error ocurred, account does not exist.')
    if(user.role == 'main_admin' || user.role == 'regular_admin'){
      user.comparePassword(req.body.password, (err, isMatch) => {
        console.log('ERROR', err)

        if(isMatch){
          const token = jwtMethod.sign({id: user._id, role: user.role}, process.env.JWT_SECRET_LOGIN, {expiresIn: '60min', algorithm: 'HS256'})

          const {_id, username, email, role} = user
          const userAdmin = {_id, username, email, role}

          let cookieTime = new Date(Date.now() + (60 * 60 * 1000))

          const cookieOptions = ";expires="+cookieTime+"; Max-Age=3600; HttpOnly";
          
          return res.status(202).cookie(
              "accessTokenAdmin", token, {
              sameSite: 'strict',
              expires: new Date(Date.now() + (60 * 60 * 1000)),
              httpOnly: true
          })
          .cookie("userAdmin", JSON.stringify(userAdmin), {
            sameSite: 'strict',
            expires: new Date(Date.now() + (60 * 60 * 1000)),
            httpOnly: true
          }).send(userAdmin)

        }else{
          return res.status(401).json('Incorrect password')
        }
      })

    }else{
      return res.status(401).json('Authorized personnel only, access denied')
    }
  })

}

exports.adminRequiresLogin = jwt({ secret: process.env.JWT_SECRET_LOGIN, algorithms: ['HS256']})

exports.readAdmin = (req, res) => {
  
  User.findById(req.auth.id, (err, user) => {
    console.log('ERROR', err)
    if(err) return res.status(400).json('User does not exists in our records.')
  
    if(user){
      return res.json({id: user._id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role})
    }else{
      return res.status(400).json('User does not exists in our records.')
    }
  })

}

exports.checkTokenExpiration = (req, res, next) => {
  if (Date.now() > req.user.exp * 1000) return res.status(406).json('Please login to continue');
  next()
}

exports.authorizedOnly = (req, res, next) => {
  if(req.user.role == 'main_admin'){
    next()
  }else if(req.user.role == 'regular_admin'){
    return res.status(400).json('Authorized users only')
  }else {
    console.log('Hello')
    return res.status(400).json('Authorized users only')
  }
}

exports.updateAdmin= (req, res) => {

  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      console.log(err)
      return res.status(500).json(err)
    } else if (err) {
      console.log(err)
      return res.status(500).json(err)
    }

    for(let key in req.body){ req.body[key] = JSON.parse(req.body[key]) }

    User.findOne({username: req.body.username, email: req.body.email}, (err, found) => {
      console.log(err)
      if(err) return res.status(400).json('Error occurred could not find item in records')

      User.findByIdAndUpdate(req.body._id, req.body, {new: true}, (err, response) => {
        if(err) return res.status(401).json('Error occurred item was not updated')
        
        User.find({}).select(['-password']).exec((err, list) => {
          if(err) return res.status(400).json(`Error ocurred loading items`)
          return res.json(list)
        })

      })

    })
    
  })  
}

exports.sendChangeAdminEmail = (req, res) => {
  const token = jwtMethod.sign({username: req.body.account.username, oldEmail: req.body.account.email, newEmail: req.body.user.email, id: req.body.account.id}, process.env.JWT_CHANGE_EMAIL, {expiresIn: '24hr'})

  const params = changeEmailTemplate(req.body.user.email, token)

  const sendEmail = ses.sendEmail(params).promise()

  sendEmail
  .then( data => {
        console.log('Email submitted on SES', data)
        return res.json(`Change email confirmation was sent to ${req.body.user.email}`)
  })
  .catch( err => {
      console.log('SES email on register', err)
      return res.status(400).json('We could not verify email address of user, please try again')
  })
}

exports.adminUpdateEmail = (req, res) => {
  jwtMethod.verify(req.body.token, process.env.JWT_CHANGE_EMAIL, (err, decoded) => {
    if(err) return res.status(401).json('URL is expired, please submit another request')
    
    User.findByIdAndUpdate(decoded.id, {email: decoded.newEmail}, {new: true}, (err, user) => {
      if(err) return res.status(400).json('Error ocurred updating your email, please try again later.')
      return res.json(`Your email was changed to ${user.email}`)
    })
  })
}

exports.allAdmin = (req, res) => {
  User.find({}).select(['-password']).exec((err, list) => {
    if(err) res.status(400).json('Error ocurred, getting admin users')
    res.json(list)
  })
}

exports.deleteAdmin = (req, res) => {

  User.findByIdAndDelete(req.body.id, (err, response) => {
    console.log(err)
    if(err) res.status(400).json('Error occurred deleting item')

    User.find({}).select(['-password']).exec((err, list) => {
      console.log(err)
      if(err) return res.status(400).json('Error occurred loading items')
      return res.json(list)
    })

  })

}

exports.forgotPassword = (req, res) => {
  
  User.findOne({email: req.body.email}, (err, user) => {
    console.log(err)
    if(!user) return res.status(400).json('Error occurred user does not exists')
    
    const token = jwtMethod.sign({ username: user.username, email: user.email }, process.env.JWT_FORGOT_PASSWORD, { expiresIn: '60min'})
    
    const params = forgotPasswordTemplate(req.body.email, token)
    
    const sendEmail = ses.sendEmail(params).promise()

    sendEmail
    .then( (data) => {
      return res.json(`Email was sent to ${req.body.email}`)
    })
    .catch( (err) => {
      console.log(err)
      return res.status(403).json('We could not verify your email, please try again later')
    })
    
  })
  
}

exports.resetPassword = (req, res) => {
  
  jwtMethod.verify(req.body.token, process.env.JWT_FORGOT_PASSWORD, (err, response) => {
    console.log(err)
    if(err) return res.status(403).json('Invalid link, please try again.')
    
    User.findOne({email: response.email}, (err, found) => {
      console.log(err)
      if(err) return res.status(403).json('Error occurred user not found')

      found.password = req.body.password
      found.save((err, update) => {
        console.log(err)
        if(err) return res.status(403).json('Error occurred could not save password')

        return res.json('Password was reset, please login with your new password')
        
      })

      
    })
    
  })
  
}

exports.logout = (req, res) => {
  res.clearCookie('userAdmin')
  res.clearCookie('accessTokenAdmin')
  return res.json('Logged out');
}