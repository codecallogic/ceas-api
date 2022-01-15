const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Component = new Schema(
{
  name: {
    type: String,
    required: true,
  },
  leader: [{
    type: Schema.Types.ObjectId, ref: 'Faculty'
  }],
  active: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  longDescription: {
    type: String,
    required: true
  }
},
{
    timestamps: true
})

module.exports = mongoose.model('Component', Component)