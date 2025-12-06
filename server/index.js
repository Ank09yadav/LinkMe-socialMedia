const express = require('express')
const cors = require('cors')
const http = require('http')

require('dotenv').config()
const connectDB = require('./config/connectDB')
const router = require('./routes/index')
const cookieParser = require('cookie-parser')
const { initSocket } = require('./socket')

const app = express()
const server = http.createServer(app)

// Initialize Socket.io
initSocket(server);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 8080

app.get('/', (request, response) => {
    response.json({
        message: "Hello ANK! Server is running at " + PORT
    })
})

//  api endpoints
app.use('/api', router);

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log("Server is running at " + PORT)
    })
})
