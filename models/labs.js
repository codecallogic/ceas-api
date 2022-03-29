const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Lab = new Schema(
{
  icon: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  labLocation: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  faculty: [{
    type: Schema.Types.ObjectId, ref: 'Faculty'
  }],
  equipment: [{
    type: Schema.Types.ObjectId, ref: 'Equipment'
  }],
},
{
    timestamps: true
})

module.exports = mongoose.model('Lab', Lab)