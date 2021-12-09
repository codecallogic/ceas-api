const {check} = require('express-validator')

exports.registerUserValidator = [
  check('username', 'Username must be at least 3 characters long and contain no spaces or special characters').custom( value => {
    let regex = /^\w+$/g
    if(regex.test(value) && value.length > 2){
      return true
    }
    return false
  }),
  check('email', 'Email is not valid').isEmail(),
  check('password', 'Password must have a minimum of 8 characters, must contain one uppercase letter, one lowercase letter, a number, and one special character').custom( value => {
    console.log(value)
    let regex = /^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$.!%*#?&]).*$/g
    if(regex.test(value)){
      return true
    }
    return false
  })
]

exports.adminLoginValidator = [
  check('username', 'Not a valid username or email, please try again').custom( value => {
    let regex = /^[^s@]+@[^/s@.]+\.[^\s@]+$|^\w{3,}$/g
    if(regex.test(value)){
      return true
    }
    return false
  })
]