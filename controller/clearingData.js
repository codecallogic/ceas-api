const Faculty = require('../models/faculty')
const Student = require('../models/student')
const Component = require('../models/component')

exports.clearComponentsFromFaculty = async (req, res, next) => {
  const { id } = req.body
  
  Faculty.find({$or: [{componentOne: id}, {componentTwo: id}, {componentThree: id}]}).exec( (err, results) => {
    if (err) {
      console.log(`[error] ${err}`);
      next(err);
    } else {

      if(results.length > 0){
        results.forEach((item) => {
          if(item.componentOne.includes(id)) item.componentOne = []
          if(item.componentTwo.includes(id)) item.componentTwo = []
          if(item.componentThree.includes(id)) item.componentThree = []
        })
      }
      
      if(results.length > 0){
        results.forEach((item) => {

          Faculty.findByIdAndUpdate(item._id, item, (err, response) => {
            if(err) return res.status(400).json('Error occurred deleting item from other records')
          })
          
        })
      }

      req.id = id
      next()
    }
  });

}

exports.clearComponentsFromStudents = (req, res, next) => {

  const { id } = req.body
  
  Student.find({component: id}).exec( (err, results) => {
    if (err) {
      console.log(`[error] ${err}`);
      next(err);
    } else {

      if(results.length > 0){
        results.forEach((item) => {
          if(item.component.includes(id)) item.component = []
        })
      }
      
      if(results.length > 0){
        results.forEach((item) => {

          Student.findByIdAndUpdate(item._id, item, (err, response) => {
            if(err) return res.status(400).json('Error occurred deleting item from other records')
          })
          
        })
      }

      req.id = id
      next()
    }
  });
  
}

exports.clearFacultyFromComponents = async (req, res, next) => {

  const { id } = req.body
  
  Component.find({leader: id}).exec( (err, results) => {
    if (err) {
      console.log(`[error] ${err}`);
      next(err);
    } else {

      if(results.length > 0){
        results.forEach((item) => {
          if(item.leader.includes(id)) item.leader = []
        })
      }
      
      if(results.length > 0){
        results.forEach((item) => {

          Component.findByIdAndUpdate(item._id, item, (err, response) => {
            if(err) return res.status(400).json('Error occurred deleting item from other records')
          })
          
        })
      }

      req.id = id
      next()
    }
  });

}

exports.clearFacultyFromStudents = async (req, res, next) => {

  const { id } = req.body
  
  Student.find({advisor: id}).exec( (err, results) => {
    if (err) {
      console.log(`[error] ${err}`);
      next(err);
    } else {

      if(results.length > 0){
        results.forEach((item) => {
          if(item.advisor.includes(id)) item.advisor = []
        })
      }
      
      if(results.length > 0){
        results.forEach((item) => {

          Student.findByIdAndUpdate(item._id, item, (err, response) => {
            if(err) return res.status(400).json('Error occurred deleting item from other records')
          })
          
        })
      }

      req.id = id
      next()
    }
  });

}