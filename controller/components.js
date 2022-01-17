const Component = require('../models/component')

exports.createComponent = (req, res) => {
  // console.log(req.body)
  for(let key in req.body){
    if(!req.body[key]) delete req.body[key]
  }

  Component.findOne({name: req.body.name}, (err, found) => {
    console.log(err)
    if(found) return res.status(400).json('Error ocurred, component with that name already exists')

    const newComponent = new Component(req.body)

    newComponent.save((err, component) => {
      console.log(err)
      if(err) return res.status(400).json('Error ocurred, creating a new component')

      Component.find({}).populate('leader').exec( (err, list) => {
        console.log(err)
        if(err) return res.status(400).json('Error ocurred loading components')
        return res.json(list)
      })
    })
  })
}

exports.allComponents = (req, res) => {
  Component.find({}).populate('leader').exec((err, list) => {
    if(err) res.status(400).json('Error ocurred loading components')
    res.json(list)
  })
}

exports.updateComponent = (req, res) => {
  // console.log(req.body)
  for(let key in req.body){if(!req.body[key]) delete req.body[key]}

  Component.findOne({name: req.body.name}, (err, found) => {
    console.log(err)
    if(err) return res.status(400).json('Error occurred, could not find user in records')

    Component.findByIdAndUpdate(req.body._id, req.body, {new: true}, (err, component) => {
      if(err) return res.status(401).json('Error occurred, component was not updated')

      Component.find({}).populate('leader').exec( (err, list) => {
        if(err) return res.status(400).json('Error occurred loading components')
        return res.json(list)
      })
    })
  })
}

exports.deleteComponent = (req, res) => {
  Component.findByIdAndDelete(req.body.id, (err, response) => {
    console.log(err)
    if(err) res.status(400).json('Error occurred deleting component')
    Component.find({}).exec((err, list) => {
      console.log(err)
      if(err) return res.status(400).json('Error occurred loading components')
      return res.json(list)
    })
  })
}