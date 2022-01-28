const mongoose = require('mongoose')
const Schema = mongoose.Schema

const News = new Schema(
{
  image: {
    type: String,
    default: ''
  },
  date: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  news: {
    type: String,
    default: ''
  },
  component: [{
    type: Schema.Types.ObjectId, ref: 'Component'
  }]
},
{
    timestamps: true
})

module.exports = mongoose.model('News', News)