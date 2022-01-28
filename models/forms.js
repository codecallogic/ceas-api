const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Form = new Schema(
{
  file: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  }
},
{
    timestamps: true
})

module.exports = mongoose.model('Form', Form)