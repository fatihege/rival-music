import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import 'dotenv/config'
import client from './lib/redis.js'
import userRoutes from './routes/user.js'
import trackRoutes from './routes/track.js'

const app = express() // Create Express server instance

app.use(cors())

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: '',
    })
})

app.use('/user', userRoutes) // Use user routes in /user endpoint
app.use('/track', trackRoutes) // Use track routes in /track endpoint

mongoose.connect(process.env.DB_URI) // Connect to the MongoDB server
    .then(() => {
        console.log('Connected to MongoDB')

        app.listen(process.env.PORT || 8000, async () => { // Listen to the server
            console.log(`Server running: http://localhost:${process.env.PORT}`)
            await client.connect() // Start Redis client
        })
    })
    .catch(err => {
        console.error('Unable to connect MongoDB:', err.message)
    })
