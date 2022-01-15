const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Faculty = new Schema(
{
  profileImage: {
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
  profession: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  officePhone: {
    type: String,
    default: ''
  },
  officeLocation: {
    type: String,
    default: ''
  },
  centerAssociation: {
    type: String,
    default: ''
  },
  componentOne: [{
    type: Schema.Types.ObjectId, ref: 'Component'
  }],
  componentTwo: [{
    type: Schema.Types.ObjectId, ref: 'Component'
  }],
  componentThree: [{
    type: Schema.Types.ObjectId, ref: 'Component'
  }],
  researchInterests: {
    type: String,
    default: ''
  }
},
{
    timestamps: true
})

module.exports = mongoose.model('Faculty', Faculty)