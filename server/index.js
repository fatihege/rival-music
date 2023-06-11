import express from 'express'
import 'dotenv/config'
import trackRoutes from './routes/track.js'
import config from './config.js'

const app = express() // Create Express server instance

app.use((req, res, next) => { // Add a middleware to check requests
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.header('Access-Control-Allow-Credentials', 'true')

    console.log(req.ip) // Log request IP to the console
    if (config.allowedIps.includes(req.ip)) next() // If request IP is allowed, continue
    else res.status(403).json({ // Otherwise, return 403 message
        status: 'FORBIDDEN',
        message: '',
    })
})

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: '',
    })
})

app.use('/track', trackRoutes) // Use track routes in /track endpoint

app.listen(process.env.PORT, () => { // Listen to the server
    console.log(`Server running: http://localhost:${process.env.PORT}`)
})