const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Sections = new Schema(
{
  type: {
    type: String,
    default: '',
  },
  path: {
    type: String,
    default: ''
  },
  order: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  }
},

{
    timestamps: true
})

module.exports = mongoose.model('Sections', Sections)