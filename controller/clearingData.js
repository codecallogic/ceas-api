const Faculty = require('../models/faculty')
const Student = require('../models/student')
const Component = require('../models/component')
const Publication = require('../models/publication')

exports.clearComponentsFromFaculty = async (req, res, next) => {
  const { id } = req.body

  Faculty.updateMany({$or: [{componentOne: id}, {componentTwo: id}, {componentThree: id}]}, {$pull: {componentOne: id, componentTwo: id, componentThree: id}}).exec( (err, results) => {
    if (err) {
      console.log(`[error] ${err}`);
      next(err);
    } else {

      req.id = id
      next()
    }
  });

}

exports.clearComponentsFromStudents = (req, res, next) => {

  const { id } = req.body
  
  Student.updateMany({component: id}, {$pull: {component: id}}).exec( (err, results) => {
    if (err) {
      console.log(`[error] ${err}`);
      next(err);
    } else {

      req.id = id
      next()
    }
  });
  
}

exports.clearComponentsFromPublications = (req, res, next) => {

  const { id } = req.body
  
  Publication.updateMany({components: id}, {$pull: {components: id}}).exec( (err, results) => {
    if (err) {
      console.log(`[error] ${err}`);
      // next(err);
    } else {
      req.id = id
      next()
    }
  });
  
}

exports.clearFacultyFromComponents = async (req, res, next) => {

  const { id } = req.body
  
  Component.updateMany({leader: id}, {$pull: {leader: id}}).exec( (err, results) => {
    if (err) {
      console.log(`[error] ${err}`);
      next(err);
    } else {
      
      req.id = id
      next()
    }
  });

}

exports.clearFacultyFromStudents = async (req, res, next) => {

  const { id } = req.body
  
  Student.updateMany({advisor: id}, {$pull: {advisor: id}}).exec( (err, results) => {
    if (err) {
      console.log(`[error] ${err}`);
      next(err);
    } else {
      
      req.id = id
      next()
    }
  });

}

exports.clearFacultyFromPublications = (req, res, next) => {

  const { id } = req.body
  
  Publication.updateMany({faculty: id}, {$pull: {faculty: id}}).exec( (err, results) => {
    if (err) {
      console.log(`[error] ${err}`);
      // next(err);
    } else {

      req.id = id
      next()
    }
  });
  
}