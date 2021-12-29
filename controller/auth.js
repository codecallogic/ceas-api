const User = require('../models/auth')
const jwt = require('jsonwebtoken')
const expressJWT = require('express-jwt')
const aws = require('aws-sdk')
const {changeEmailTemplate} = require('../templates/changeEmail')

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

const ses = new aws.SES({ apiVersion: '2010-12-01'})

exports.createAdmin = (req, res) => {
  console.log(req.body)
  // User.findOne({or: [{username: req.body.username, email: req.body.email}]}, (err, user) => {
  //   console.log(err)
  //   if(user) return res.status(400).json('Error ocurred, username or email exists.')
  //   const newUser = new User(req.body)
  //   newUser.save((err, result) => {
  //     console.log(err)
  //     if(err) return res.status(401).json('Error ocurred, could not register admin, please try again later')
  //     return res.json('Admin created')
  //   })
  // })
}

exports.adminLogin = async (req, res) => {
  // console.log(req.body)
  // console.log('PARSER', req.body.password.replace(/<[^>]+>/g, ''))
  req.body.password = req.body.password.replace(/<[^>]+>/g, '')
  User.findOne({$or: [{username: req.body.username}, {email: req.body.username}]}, (err, user) => {
    console.log(err)
    if(err || !user) return res.status(401).json('Error ocurred, account does not exist.')
    if(user.role == 'admin'){
      user.comparePassword(req.body.password, (err, isMatch) => {
        console.log(err)

        if(isMatch){
          const token = jwt.sign({id: user._id}, process.env.JWT_SECRET_LOGIN, {expiresIn: '60min', algorithm: 'HS256'})
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
    console.log(err)
    if(err) return res.status(401).json('User does not exists in our records.')
    return res.json({id: user._id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role})
  })
}

exports.updateAdmin= (req, res) => {
  for(let key in req.body.user){if(!req.body.user[key]) delete req.body.user[key]}

  User.findOne({username: req.body.user.username}, (err, found) => {
    console.log(err)
    if(found) return res.status(400).json('Error occurred, usename already exists.')

    User.findByIdAndUpdate(req.body.account.id, req.body.user, {new: true}, (err, user) => {
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