const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NavMenu = new Schema(
{
  name: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  },
  items: [{
    type: Schema.Types.ObjectId, ref: 'NavItem'
  }],
  order: {
    type: String,
    default: ''
  }
},
{
    timestamps: true
})

module.exports = mongoose.model('NavMenu', NavMenu)