const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

//// SLIDES
const NavMenu = require('./models/navMenu')
const Slide = require('./models/slides')

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

// MIDDLEWARE
const { adminRequiresLogin } = require('./controller/auth')
app.use(morgan('dev'));
app.use(express.json());
// app.use('/files/storage/publication', adminRequiresLogin, express.static('public'))
app.use('/files/storage', express.static('public'))
app.use(cors({credentials: true, origin: process.env.CLIENT_URL}))

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

const port = process.env.PORT || 3001

const server = app.listen(port, () => console.log(`Server is running on port ${port}`))

const io = require('socket.io')(server, {cookie: false})
global.io = io

io.on('connection', async (socket) => {

  NavMenu.find({}).populate({path: 'items', select: '-_id'}).select(['-_id']).exec( (err, list) => {
    console.log(err)
    if(err) return
    socket.emit('navigation', list)
    
  })

  Slide.find({}).populate({path: 'component', select: '-_id'}).select(['-_id']).exec((err, list) => {
    console.log(err)
    if(err) return
    socket.emit('slides', list)
    
  })

})