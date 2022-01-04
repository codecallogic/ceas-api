const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
require('./config/database')

const app = express()

// ROUTES
const authRoutes = require('./routes/auth')

// MIDDLEWARE
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({credentials: true, origin: process.env.CLIENT_URL}))

app.use('/api/auth', authRoutes, (err, res, next) => {
  if(err.name === 'UnauthorizedError') return res.status(400).json('Error ocurred, please login first.')
 })

const port = process.env.PORT || 3001

app.listen(port, () => console.log(`Server is running on port ${port}`))