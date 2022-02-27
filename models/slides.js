const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Slide = new Schema(
{
  image: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  caption: {
    type: String,
    default: ''
  },
  component: [{
    type: Schema.Types.ObjectId, ref: 'Component'
  }],
},
{
    timestamps: true
})

module.exports = mongoose.model('Slide', Slide)