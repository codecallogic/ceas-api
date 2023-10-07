const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')

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

app.use(morgan('dev'));
app.use(express.json());
app.use('/files/storage', express.static('public', { maxAge: 31536000 } ))
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }))
// app.use(bodyParser.urlencoded({ extended: false }))

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

const port = process.env.PORT || 4001

const server = app.listen(port, () => console.log(`Server is running on port ${port}`))