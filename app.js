const config = require('./utils/config')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const blogRouter = require('./controllers/blogs')

const app = express()

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('connected to mongodb')
    })
    .catch(error => {
        console.log('error connecting to mongodb', error)
    })

app.use(cors())

app.use(bodyParser.json())

app.use('/api/blog', blogRouter)

module.exports = app