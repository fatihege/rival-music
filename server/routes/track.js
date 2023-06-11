import express from 'express'
import {join} from 'path'
import {createReadStream, existsSync} from 'fs'
import {promisify} from 'util'
import {exec as execCmd} from 'child_process'
import {__dirname} from '../utils/dirname.js'

const router = express.Router() // Create Express router instance
const exec = promisify(execCmd) // Promisify exec function

router.get('/:track', (req, res) => {
    const {track} = req.params // Get track file name from request parameters
    const range = req.headers.range?.replace('bytes=', '').split('-').map(v => parseInt(v)) // Get range from Range header
    const trackPath = join(__dirname, '..', 'audio', 'manifest', track) // Create track path

    const readStream = createReadStream(trackPath, (req.headers.range && !range.includes(NaN)) ? {start: range[0], end: range[1]} : {}) // Create read stream to track file. If range is set, read the range. If it is not, read whole file
    readStream.pipe(res) // Pipe read stream to the response
})

router.get('/manifest/:track', async (req, res) => {
    const {track} = req.params // Get track file name from request parameters
    const trackPath = join(__dirname, '..', 'audio', track) // Create track path
    const destination = join(__dirname, '..', 'audio', 'manifest', track) // Create destination of track manifest
    const isExists = existsSync(`${destination}.m3u8`) // Is manifest file exists

    if (!isExists) { // If manifest file is not exists
        const {err} = await exec(`ffmpeg -i ${trackPath} -c copy -level 3.0 -start_number 0 -hls_time 10 -hls_list_size 0 -hls_flags single_file -f hls ${destination}.m3u8`) // Execute FFmpeg command

        if (err) { // If there is an error
            console.error(err) // Write error to the console

            return res.status(500).json({ // Return response
                status: 'ERROR',
                message: err.message,
            })
        }
    }

    const readManifest = createReadStream(`${destination}.m3u8`) // Create read stream for manifest file if exists
    let result = '' // Create empty string for result

    readManifest.on('data', data => {
        result += data.toString() // Concatenate result with data when data is read
    })

    readManifest.on('end', () => {
        result = result.replaceAll(track, `${process.env.API_URL || 'https://rival-music-api.fatxh.repl.co'}/track/${track}`) // Replace segment file names with URL
        res.status(200).header('application/vnd.apple.mpegurl').send(result) // Return response
    })

    readManifest.on('error', err => { // If an error occurs while reading manifest file
        console.error(err) // Write error to the console

        res.status(500).json({ // Return response
            status: 'ERROR',
            message: err.message,
        })
    })
})

export default router