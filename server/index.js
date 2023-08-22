import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import fs from 'fs'
import mime from 'mime'
import {join} from 'path'
import 'dotenv/config'
import client from './lib/redis.js'
import adminRoutes from './routes/admin.js'
import userRoutes from './routes/user.js'
import artistRoutes from './routes/artist.js'
import albumRoutes from './routes/album.js'
import trackRoutes from './routes/track.js'
import adminMiddleware from './middlewares/admin.js'
import checkDir from './utils/check-dir.js'
import {__dirname} from './utils/dirname.js'
import config from './config.js'

const app = express() // Create Express server instance

app.use(cors()) // Enable CORS
app.use(bodyParser.urlencoded({extended: true})) // Parse URL-encoded body
app.use(bodyParser.json()) // Parse JSON body

app.use((req, res, next) => {
    if (req.ip && config.allowedIps.includes(req.ip)) next() // If the host IP is allowed, continue
    else return res.status(401).send() // Otherwise, return 401 response
})

app.get('/api/uploads/:file', (req, res) => {
    const {file} = req.params // Get file name from request parameters
    const dir = join(__dirname, '..', 'public', 'uploads') // Get path to the uploads directory
    const imagePath = join(dir, file) // Get path to the file
    const mimeType = mime.getType(imagePath) // Get MIME type of the file

    checkDir(dir) // If uploads directory is not exist, create it

    if (!fs.existsSync(imagePath)) return res.status(404).json({ // If image is not exist, return 404 response
        status: 'NOT FOUND',
    })

    if (mimeType) res.setHeader('Content-Type', mimeType) // Set content type header
    res.setHeader('Cache-Control', 'public, max-age=86400') // Set cache control header
    const stream = fs.createReadStream(imagePath) // Create read stream for image
    stream.pipe(res) // Pipe read stream into response
})

app.use('/api/admin/:token', adminMiddleware, adminRoutes) // Use admin routes in /admin/:token endpoint
app.use('/api/user', userRoutes) // Use user routes in /user endpoint
app.use('/api/artist', artistRoutes) // Use artist routes in /artist endpoint
app.use('/api/album', albumRoutes) // Use album routes in /album endpoint
app.use('/api/track', trackRoutes) // Use track routes in /track endpoint

app.get('/api', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: '',
    })
})

mongoose.connect(process.env.DB_URI) // Connect to the MongoDB server
    .then(() => {
        console.log('Connected to MongoDB')

        app.listen(process.env.PORT || 8000, async () => { // Listen to the server
            console.log(`Server running: http://localhost:${process.env.PORT}`)
            await client.connect() // Start Redis client
        })
    })
    .catch(err => console.error('Unable to connect MongoDB:', err.message))