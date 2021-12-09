const User = require('../models/auth')
const jwt = require('jsonwebtoken')
const expressJWT = require('express-jwt')

exports.createAdmin = (req, res) => {
  User.findOne({or: [{username: req.body.username, email: req.body.email}]}, (err, user) => {
    console.log(err)
    if(user) return res.status(400).json('Error ocurred, username or email exists.')
    const newUser = new User(req.body)
    newUser.save((err, result) => {
      console.log(err)
      if(err) return res.status(401).json('Error ocurred, could register admin, please try again later')
      return res.json('Admin created')
    })
  })
}

exports.adminLogin = async (req, res) => {
  // console.log(req.body)
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
  console.log(req.user)
  User.findById(req.user.id, (err, user) => {
    console.log(err)
    if(err) return res.status(401).json('User does not exists in our records.')
    return res.json({username: user.username, email: user.email, firsName: user.firstName, lastName: user.lastName, role: user.role})
  })
}