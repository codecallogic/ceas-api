const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NavItem = new Schema(
{
  name: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  }
},
{
    timestamps: true
})

module.exports = mongoose.model('NavItem', NavItem)