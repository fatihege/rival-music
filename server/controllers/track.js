import {join} from 'path'
import {createReadStream, existsSync, statSync} from 'fs'
import Track from '../models/track.js'
import client from '../lib/redis.js'
import checkDir from '../utils/check-dir.js'
import {__dirname} from '../utils/dirname.js'
import createManifest from '../utils/create-manifest.js'

export const getTrack = async (req, res) => {
    const {track} = req.params // Get track file name from request parameters
    const range = req.headers.range?.replace('bytes=', '').split('-').map(v => parseInt(v)) // Get range from Range header
    const trackPath = join(__dirname, '..', 'audio', 'manifest', track) // Create track path

    try {
        const trackSize = statSync(trackPath)?.size // Get track file size
        if (Array.isArray(range) && range?.length && !range.includes(NaN)) // If range is set
            res.writeHead(206, { // Send partial content response to the client
                'Content-Range': `bytes ${range[0]}-${range[1] + 1}/${trackSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': Math.abs(range[1] + 1 - range[0]),
                'Content-Type': 'audio/mp4',
            })
        else res.writeHead(200, { // Send OK response to the client
            'Content-Length': trackSize,
            'Content-Type': 'audio/mp4',
        })
        const readStream = createReadStream(trackPath, (req.headers.range && !range.includes(NaN)) ? {start: range[0], end: range[1] + 1} : {}) // Create read stream to track file. If range is set, read the range. If it is not, read whole file
        readStream.pipe(res) // Pipe read stream to the response
    } catch (e) {
        res.status(500).json({ // Send error response to the client
            status: 'ERROR',
            message: e.message,
        })
    }
}

export const getManifest = async (req, res) => {
    try {
        const {track} = req.params // Get track file name from request parameters
        const trackFileName = track.slice(0, track.lastIndexOf('.'))
        let trackPath = join(__dirname, '..', 'audio', track) // Create track path
        const manifestPath = join(__dirname, '..', 'audio', 'manifest') // Create manifest directory path
        const destination = join(manifestPath, trackFileName) // Create destination of track manifest

        if (!existsSync(trackPath)) trackPath = join(__dirname, '..', 'audio', 'manifest', track.slice(0, track.lastIndexOf('.')) + '.ts') // If track file is not exists, try to find it in manifest directory

        try {
            checkDir(manifestPath) // Check if manifest directory exists
        } catch (e) {
            throw new Error(e.message)
        }

        const cacheValue = await client.get(`manifest:${trackFileName}`)
        if (cacheValue) return res.status(200).set({ // If manifest file is cached return cached file
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Cache-Control': 'public, max-age=86400',
        }).send(Buffer.from(cacheValue))

        const isExists = existsSync(`${destination}.m3u8`) // Is manifest file exists

        if (!isExists) { // If manifest file is not exists
            try {
                const {err} = createManifest(trackPath, destination) // Create manifest file

                if (err) { // If there is an error
                    console.error(err) // Write error to the console

                    return res.status(500).json({ // Return response
                        status: 'ERROR',
                        message: err.message,
                    })
                }
            } catch (e) {
                throw new Error(e.message)
            }
        }

        try {
            const readManifest = createReadStream(`${destination}.m3u8`) // Create read stream for manifest file if exists
            let result = '' // Create empty string for result

            readManifest.on('data', data => {
                result += data.toString() // Concatenate result with data when data is read
            })

            readManifest.on('end', async () => {
                result = result.replaceAll(`${trackFileName}.ts`, `${process.env.API_URL}/track/${trackFileName}.ts`) // Replace segment file names with URL
                res.status(200).set({ // Set response headers
                    'Content-Type': 'application/vnd.apple.mpegurl',
                    'Cache-Control': 'public, max-age=86400',
                }).send(Buffer.from(result)) // Return response
                await client.set(`manifest:${trackFileName}`, result, { // Cache manifest file for 24 hours
                    EX: 86400,
                    NX: true,
                })
            })

            readManifest.on('error', err => { // If an error occurs while reading manifest file
                console.error(err) // Write error to the console

                res.status(500).json({ // Return response
                    status: 'ERROR',
                    message: err.message,
                })
            })
        } catch (e) {
            throw new Error(e.message)
        }
    } catch (e) {
        res.status(500).json({ // Send error response to the client
            status: 'ERROR',
            message: e.message,
        })
    }
}

export const getTrackInfo = async (req, res) => {
    try {
        const {id} = req.params // Get track ID from request parameters

        if (!id) throw new Error('ID is not defined') // If ID is not defined, throw an error

        // Get track and populate its album field and populate artist field in album field
        const track = await Track.findById(id).populate({
            path: 'album',
            select: 'title cover',
            populate: {
                path: 'artist',
                select: 'name',
            },
        })

        return res.status(200).json({ // Send OK response to the client
            status: 'OK',
            message: 'Track info is successfully fetched',
            track,
        })
    } catch (e) {
        res.status(500).json({ // Send error response to the client
            status: 'ERROR',
            message: e.message,
        })
    }
}