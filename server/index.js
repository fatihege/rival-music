import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import sharp from 'sharp'
import fs from 'fs'
import mime from 'mime'
import {join} from 'path'
import 'dotenv/config'
import index from './lib/search.js'
import client from './lib/redis.js'
import App from './models/app.js'
import adminRoutes from './routes/admin.js'
import userRoutes from './routes/user.js'
import artistRoutes from './routes/artist.js'
import albumRoutes from './routes/album.js'
import trackRoutes from './routes/track.js'
import playlistRoutes from './routes/playlist.js'
import exploreRoutes from './routes/explore.js'
import requestRoutes from './routes/request.js'
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
    const filePath = join(dir, file) // Get path to the file
    const mimeType = mime.getType(filePath) // Get MIME type of the file

    checkDir(dir) // If uploads directory is not exist, create it

    if (!fs.existsSync(filePath)) return res.status(404).json({ // If file is not exist, return 404 response
        status: 'NOT FOUND',
    })

    if (!mimeType.startsWith('image')) {
        if (mimeType) res.setHeader('Content-Type', mimeType) // Set content type header
        res.setHeader('Cache-Control', 'public, max-age=86400') // Set cache control header
        const stream = fs.createReadStream(filePath) // Create read stream for file
        stream.pipe(res) // Pipe read stream into response
    } else {
        const {width, height, format} = req.query // Get width and height from query parameters
        const image = sharp(filePath) // Create sharp instance for image

        if (width && height) image.resize(parseInt(width), parseInt(height)) // Resize image if width and height are defined

        if (format) image.toFormat(format, {quality: 100}) // If format is defined, convert image to that format
        else image.toFormat('jpeg', {quality: 100}) // Otherwise, convert image to JPEG format

        image.toBuffer((err, data) => { // Convert image to buffer
            if (err) return res.status(500).json({ // If error occurred, return 500 response
                status: 'INTERNAL SERVER ERROR',
                message: err.message,
            })

            res.setHeader('Content-Type', `image/${format || 'jpeg'}`) // Set content type header
            res.setHeader('Cache-Control', 'public, max-age=432000') // Set cache control header
            res.setHeader('Content-Length', data.length) // Set content length header
            res.send(data) // Send image buffer
        })
    }
})

app.use('/api/admin', adminMiddleware, adminRoutes) // Use admin routes in /admin endpoint
app.use('/api/user', userRoutes) // Use user routes in /user endpoint
app.use('/api/artist', artistRoutes) // Use artist routes in /artist endpoint
app.use('/api/album', albumRoutes) // Use album routes in /album endpoint
app.use('/api/track', trackRoutes) // Use track routes in /track endpoint
app.use('/api/playlist', playlistRoutes) // Use playlist routes in /playlist endpoint
app.use('/api/explore', exploreRoutes) // Use explore routes in /explore endpoint
app.use('/api/request', requestRoutes) // Use request routes in /request endpoint

app.get('/api', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: '',
    })
})

mongoose.connect(process.env.DB_URI) // Connect to the MongoDB server
    .then(async () => {
        console.log('Connected to MongoDB')

        const appCount = await App.find().count() // Get app document count
        if (appCount < 1) await App.create({}) // If there is no app document, create it
        else if (appCount > 1) {
            await App.deleteMany() // If there is more than one app document, delete all of them except one
            await App.create({}) // Create a new app document
        }

        await index.init() // Initialize FlexSearch

        app.listen(process.env.PORT || 8000, async () => { // Listen to the server
            console.log(`Server running: http://localhost:${process.env.PORT}`)
            await client.connect() // Start Redis client
        })
    })
    .catch(err => console.error('Unable to connect MongoDB:', err.message))