const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Publication = new Schema(
{
  file: {
    type: String,
    default: '',
  },
  date: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  authors: {
    type: Array,
    default: [],
  },
  venues: {
    type: Array,
    default: [],
  },
  type: {
    type: String,
  },
  link: {
    type: String,
  },
  faculty: [{
    type: Schema.Types.ObjectId, ref: 'Faculty'
  }],
  components: [{
    type: Schema.Types.ObjectId, ref: 'Component'
  }]
},
{
    timestamps: true
})

module.exports = mongoose.model('Publication', Publication)