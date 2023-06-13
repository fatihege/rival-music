import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import client from './lib/redis.js'
import trackRoutes from './routes/track.js'

const app = express() // Create Express server instance

app.use(cors())

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: '',
    })
})

app.use('/track', trackRoutes) // Use track routes in /track endpoint

app.listen(process.env.PORT || 8000, async () => { // Listen to the server
    console.log(`Server running: http://localhost:${process.env.PORT}`)
    await client.connect() // Start Redis client
})
