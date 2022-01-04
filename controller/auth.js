const User = require('../models/auth')
const jwt = require('jsonwebtoken')
const expressJWT = require('express-jwt')
const aws = require('aws-sdk')
const {generatePassword} = require('../helpers/auth')

// EMAIL TEMPLATES //
const {changeEmailTemplate} = require('../templates/changeEmail')
const {inviteAdmin} = require('../templates/inviteAdmin')

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

const ses = new aws.SES({ apiVersion: '2010-12-01'})

exports.inviteAdmin = async (req, res) => {
  let password = await generatePassword()
  req.body.password = password
  // console.log('INVITE ADMIN', req.body)

  User.findOne({username: req.body.username, email: req.body.email}, (err, user) => {
    console.log(err)
    if(user) return res.status(400).json('Error ocurred, username or email exists.')
    
    const token = jwt.sign(req.body, process.env.JWT_INVITATION_SECRET, {expiresIn: '24hr'})

    const params = inviteAdmin(req.body.email, token, req.body.firstName, req.body.username, req.body.password)
    
    const sendEmail = ses.sendEmail(params).promise()

    sendEmail.then(data => {
      console.log('EMAIL SENT', data)
      return res.json(`Invite was sent to ${req.body.email}`)
    }).catch( err => {
      console.log('EMAIL ERROR', err)
      return res.status(400).json('We could not verify your email address, please try again')
    })
    
  })
  
}

exports.activateAdmin = (req, res) => {

  jwt.verify(req.body.token, process.env.JWT_INVITATION_SECRET, function(err, decoded){
    if(err){
      console.log(err)
      return res.status(400).json('This url has expired, please try again later.')
    }

    User.findOne({email: decoded.email, username: decoded.username}, (err, found) => {
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
          const token = jwt.sign({id: admin._id, role: admin.role}, process.env.JWT_SECRET_LOGIN, {expiresIn: '60min', algorithm: 'HS256'})
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
  // console.log('PARSER', req.body.password.replace(/<[^>]+>/g, ''))
  req.body.password = req.body.password.replace(/<[^>]+>/g, '')

  User.findOne({$or: [{username: req.body.username}, {email: req.body.username}]}, (err, user) => {
    console.log(err)
    if(err || !user) return res.status(401).json('Error ocurred, account does not exist.')
    if(user.role == 'admin' || user.role == 'regular_admin'){
      user.comparePassword(req.body.password, (err, isMatch) => {
        console.log(err)

        if(isMatch){
          const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET_LOGIN, {expiresIn: '60min', algorithm: 'HS256'})
          const {_id, username, email, role} = user
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

        }else{
          return res.status(401).json('Incorrect password')
        }
      })

    }else{
      return res.status(401).json('Authorized personnel only, access denied')
    }
  })
}

exports.adminRequiresLogin = expressJWT({ secret: process.env.JWT_SECRET_LOGIN, algorithms: ['HS256']})

exports.readAdmin = (req, res) => {
  User.findById(req.user.id, (err, user) => {
    console.log('ERROR', err)
    if(err) return res.status(400).json('User does not exists in our records.')
  
    if(user){
      return res.json({id: user._id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role})
    }else{
      return res.status(400).json('User does not exists in our records.')
    }
  })
}

exports.authorizedOnly = (req, res, next) => {
  if(req.user.role == 'admin'){
    next()
  }else if(req.user.role == 'regular_admin'){
    return res.status(400).json('Authorized users only')
  }else {
    return res.status(400).json('Authorized users only')
  }
}

exports.updateAdmin= (req, res) => {
  for(let key in req.body.user){if(!req.body.user[key]) delete req.body.user[key]}

  User.findOne({username: req.body.user.username, email: req.body.user.email}, (err, found) => {
    console.log(err)
    if(err) return res.status(400).json('Error occurred, could not find user in records')

    let id = req.body.account ? req.body.account.id : req.body.user._id

    User.findByIdAndUpdate(id, req.body.user, {new: true}, (err, user) => {
      if(err) return res.status(401).json('Error occurred, user was not updated')
      return res.json(user)
    })
  })
}

exports.sendChangeAdminEmail = (req, res) => {
  const token = jwt.sign({username: req.body.account.username, oldEmail: req.body.account.email, newEmail: req.body.user.email, id: req.body.account.id}, process.env.JWT_CHANGE_EMAIL, {expiresIn: '24hr'})

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
  jwt.verify(req.body.token, process.env.JWT_CHANGE_EMAIL, (err, decoded) => {
    if(err) return res.status(401).json('URL is expired, please submit another request')
    
    User.findByIdAndUpdate(decoded.id, {email: decoded.newEmail}, {new: true}, (err, user) => {
      if(err) return res.status(400).json('Error ocurred updating your email, please try again later.')
      return res.json(`Email was to ${decoded.newEmail}`)
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
    if(err) res.status(400).json('Error occurred deleting admin user')
    User.find({}, (err, list) => {
      console.log(err)
      if(err) return res.status(400).json('Error occurred loading admin users')
      return res.json(list)
    })
  })
}