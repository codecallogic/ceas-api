const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Faculty = new Schema(
{
  profileImage: {
    type: String,
  },
  title: {
    type: String,
  },
  name: {
    type: String,
  },
  profession: {
    type: String,
  },
  department: {
    type: String
  },
  email: {
    type: String
  },
  website: {
    type: String
  },
  officePhone: {
    type: String
  },
  officeLocation: {
    type: String
  },
  centerAssociation: {
    type: String
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
    type: String
  }
},
{
    timestamps: true
})

module.exports = mongoose.model('Faculty', Faculty)