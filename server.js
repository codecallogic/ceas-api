const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
require('./config/database')

const app = express()

// ROUTES
const authRoutes = require('./routes/auth')
const componentRoutes = require('./routes/components')
const facultyRoutes = require('./routes/faculty')
const studentRoutes = require('./routes/student')
const staffRoutes = require('./routes/staff')

// MIDDLEWARE
app.use(morgan('dev'));
app.use(express.json());
app.use('/files/storage', express.static('public'))
app.use(cors({credentials: true, origin: process.env.CLIENT_URL}))

app.use('/api/auth', authRoutes)
app.use('/api/component', componentRoutes)
app.use('/api/faculty', facultyRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/staff', staffRoutes)

const port = process.env.PORT || 3001

app.listen(port, () => console.log(`Server is running on port ${port}`))