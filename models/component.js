const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Component = new Schema(
{
  name: {
    type: String,
    default: ''
  },
  leader: [{
    type: Schema.Types.ObjectId, ref: 'Faculty'
  }],
  active: {
    type: String,
    default: ''
  },
  shortDescription: {
    type: String,
    default: ''
  },
  longDescription: {
    type: String,
    default: ''
  }
},
{
    timestamps: true
})

module.exports = mongoose.model('Component', Component)