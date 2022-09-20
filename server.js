const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

//// MODELS
const NavMenu = require('./models/navMenu')
const Slide = require('./models/slides')
const Component = require('./models/component')
const News = require('./models/news')
const Faculty = require('./models/faculty')
const Student = require('./models/student')
const Lab = require('./models/labs')
const Equipment = require('./models/equipment')
const Staff = require('./models/staff')
const Publication = require('./models/publication')
const Section = require('./models/sections')

require('dotenv').config()
require('./config/database')

const app = express()

// ROUTES
const authRoutes = require('./routes/auth')
const componentRoutes = require('./routes/components')
const facultyRoutes = require('./routes/faculty')
const studentRoutes = require('./routes/student')
const staffRoutes = require('./routes/staff')
const publicationRoutes = require('./routes/publications')
const newsRoutes = require('./routes/news')
const slideRoutes = require('./routes/slides')
const labRoutes = require('./routes/labs')
const equipmentRoutes = require('./routes/equipment')
const formRoutes = require('./routes/forms')
const navigationRoutes = require('./routes/navigation')
const sectionRoutes = require('./routes/sections')

// MIDDLEWARE

app.use(morgan('dev'));
app.use(express.json());
// app.use('/files/storage/publication', adminRequiresLogin, express.static('public'))
app.use('/files/storage', express.static('public'))
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://catsus.calstatela.edu",
    "https://catsus.calstatela.edu",
    "http://catsus.calstatela.edu:3001",
    "https://catsus.calstatela.edu:3001"
  ],
  credentials: true,
  origin: true,
  origin: process.env.CLIENT_URL
}))

app.use('/api/auth', authRoutes)
app.use('/api/component', componentRoutes)
app.use('/api/faculty', facultyRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/publication', publicationRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/slide', slideRoutes)
app.use('/api/lab', labRoutes)
app.use('/api/equipment', equipmentRoutes)
app.use('/api/form', formRoutes)
app.use('/api/navigation', navigationRoutes)
app.use('/api/section', sectionRoutes)

const port = process.env.PORT || 3001

const server = app.listen(port, () => console.log(`Server is running on port ${port}`))

// const io = require('socket.io')(server, {cookie: false})
// global.io = io

// io.on('connection', async (socket) => {

  // NavMenu.find({}).populate({path: 'items', select: '-_id'}).select(['-_id']).exec( (err, list) => {
  //   console.log(err)
  //   if(err) return
  //   socket.emit('navigation', list)
    
  // })

  // Slide.find({}).populate({path: 'component', select: '-_id'}).select(['-_id']).exec((err, list) => {
  //   console.log(err)
  //   if(err) return
  //   socket.emit('slides', list)
    
  // })

  // Component.find({}).populate({path: 'leader', select: '-_id'}).select(['-_id']).exec( (err, list) => {
  //   console.log(err)
  //   if(err) return
  //   socket.emit('components', list)

  // })

  // News.find({}).populate({path: 'component', select: '-_id'}).select(['-_id']).exec((err, list) => {
  //   if(err) return
  //   socket.emit('news', list)
  // })

  // Faculty.find({}).populate([{path: 'componentOne', select: '-_id'}, {path: 'componentTwo', select: '-_id'}, {path: 'componentThree', select: '-_id'}]).select(['-_id']).exec((err, list) => {
  //   if(err) return
  //   socket.emit('faculty', list)
  // })

  // Student.find({}).populate([{path: 'advisor', select: '-_id'}, {path: 'component', select: '-_id'}]).select(['-_id']).exec((err, list) => {
  //   if(err) return res.status(401).json('Item was deleted but there was an error loading table items')
  //   socket.emit('students', list)
  // })

  // Lab.find({}).populate([{path: 'faculty', select: '-_id'}, {path: 'equipment', select: '-_id'}]).select(['-_id']).exec((err, list) => {
  //   console.log(err)
  //   if(err) return
  //   socket.emit('labs', list)

  // })

  // Equipment.find({}).populate([{path: 'lab', select: '-_id'}]).select(['-_id']).exec((err, list) => {
  //   console.log(err)
  //   if(err) return 
  //   socket.emit('equipment', list)

  // })

  // Staff.find({}).exec((err, list) => {
  //   console.log(err)
  //   if(err) return
  //   socket.emit('staff', list)

  // })

  // Publication.find({}).populate([{path: 'faculty', select: '-_id'}, {path: 'components', select: '-_id'}]).select(['-_id']).exec((err, list) => {
  //   console.log(err)
  //   if(err) return 
  //   socket.emit('publication', list)

  // })

  // Section.find({}).select(['-_id']).exec((err, list) => {
  //   console.log(err)
  //   if(err) return 
  //   socket.emit('section', list)

  // })
  
// })