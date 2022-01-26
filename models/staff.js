const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Staff = new Schema(
{
  image: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  position: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
},
{
    timestamps: true
})

module.exports = mongoose.model('Staff', Staff)