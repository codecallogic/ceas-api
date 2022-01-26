const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Student = new Schema(
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
  advisor: [{
    type: Schema.Types.ObjectId, ref: 'Faculty', default: ''
  }],
  department: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  centerAssociation: {
    type: String,
    default: ''
  },
  component: [{
    type: Schema.Types.ObjectId, ref: 'Component', default: ''
  }],
  status: {
    type: String,
    default: ''
  },
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  },
  postGraduation: {
    type: String,
    default: ''
  }
},
{
    timestamps: true
})

module.exports = mongoose.model('Student', Student)