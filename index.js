const { PORT } = require('./utils/config')
const app = require('./app')
const http = require('http')

const server = http.createServer(app)

server.listen(PORT, () => {
    console.log(`server started on port ${PORT}`)
})
