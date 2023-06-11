import express from 'express'
import 'dotenv/config'
import trackRoutes from './routes/track.js'
import config from './config.js'

const app = express() // Create Express server instance

app.use((req, res, next) => { // Add a middleware to check requests
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    res.header('Access-Control-Allow-Credentials', 'true')

    next()
})

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: '',
    })
})

app.use('/track', trackRoutes) // Use track routes in /track endpoint

app.listen(process.env.PORT || 8000, () => { // Listen to the server
    console.log(`Server running: http://localhost:${process.env.PORT}`)
})