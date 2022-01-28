const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Equipment = new Schema(
{
  image: {
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
  },
  lab: [{
    type: Schema.Types.ObjectId, ref: 'Lab'
  }],
},
{
    timestamps: true
})

module.exports = mongoose.model('Equipment', Equipment)