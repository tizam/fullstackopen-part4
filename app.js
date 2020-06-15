const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')
const blogRouter = require('./controllers/blogs')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

const app = express()

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log('connected to mongodb')
  })
  .catch((error) => {
    console.log('error connecting to mongodb', error)
  })

app.use(cors())

app.use(bodyParser.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/users', userRouter)
app.use('/api/blog', blogRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app
