import {join} from 'path'
import {createReadStream, existsSync, statSync} from 'fs'
import Track from '../models/track.js'
import Artist from '../models/artist.js'
import Album from '../models/album.js'
import User from '../models/user.js'
import client from '../lib/redis.js'
import index from '../lib/search.js'
import createManifest from '../utils/create-manifest.js'
import escapeRegexp from '../utils/escape-regexp.js'
import checkDir from '../utils/check-dir.js'
import {__dirname} from '../utils/dirname.js'

export const getTrack = async (req, res) => {
    try {
        const {track} = req.params // Get track file name from request parameters
        const range = req.headers.range?.replace('bytes=', '').split('-').map(v => parseInt(v)) // Get range from Range header
        const trackPath = join(__dirname, '..', 'audio', 'manifest', track) // Create track path
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
        const readStream = createReadStream(trackPath, (req.headers.range && !range.includes(NaN)) ? {
            start: range[0],
            end: range[1] + 1
        } : {}) // Create read stream to track file. If range is set, read the range. If it is not, read whole file
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

                if (err) // If there is an error
                    return res.status(500).json({ // Return response
                        status: 'ERROR',
                        message: err.message,
                    })
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
        const {lyrics = null, populate = null, user: userId = null} = req.query // Get populate from request query

        if (!id) return res.status(400).json({ // If there is no track ID, return 400 response
            status: 'ERROR',
            message: 'Track ID is required',
        })

        // Get track and populate its album field and populate artist field in album field
        const track = await Track.findById(id)
            .select(Number(lyrics) !== 1 ? '-lyrics' : '')
            .populate({
                path: 'album',
                select: `title cover`,
                populate: {
                    path: 'artist',
                    select: 'name',
                },
            }).populate({
                path: 'artists',
                select: `name ${populate === 'all' ? 'image' : ''}`,
            })

        if (!track) return res.status(404).json({ // If track is not exists, return 404 response
            status: 'ERROR',
            message: 'Track is not exists',
        })

        if (track?.lyrics?.length) {
            track.lyrics = track.lyrics.map(lyric => {
                lyric.start = `${Math.floor(lyric.start / 60000)}:${Math.floor((lyric.start % 60000) / 1000)}:${lyric.start % 1000}` // Convert milliseconds to minutes, seconds and milliseconds
                return lyric
            })
        }

        let liked = false
        if (userId) {
            const user = await User.findById(userId) // Find user by ID
            if (user && user.likedTracks?.find(t => t.toString() === id)) liked = true // If track is liked by user, set liked to true
        }

        return res.status(200).json({ // Send OK response to the client
            status: 'OK',
            message: 'Track info is successfully fetched',
            track: {
                ...(track?._doc || []),
                liked,
            },
        })
    } catch (e) {
        res.status(500).json({ // Send error response to the client
            status: 'ERROR',
            message: e.message,
        })
    }
}

export const getUserTracks = async (req, res) => {
    try {
        const {id} = req.params // Get user ID from request params
        const {cursor, limit} = req.query // Get cursor, limit and sorting from request query

        if (!id) return res.status(400).json({ // If there is no user ID, return 400 response
            status: 'ERROR',
            message: 'User ID is required.',
        })

        const user = await User.findById(id) // Find user by ID

        if (!user) return res.status(404).json({ // If there is no user, return 404 response
            status: 'ERROR',
            message: 'User not found.',
        })

        const tracks = await Track.find({ // Find tracks by IDs
            _id: {
                $in: user.likedTracks || [],
            },
        }).populate({ // Populate album field
            path: 'album',
            select: 'title cover artist',
            populate: { // Populate artist field in album field
                path: 'artist',
                select: 'name',
            },
        }).skip(!isNaN(Number(cursor)) ? cursor : 0).limit(!isNaN(Number(limit)) ? limit : 0) // Skip cursor and limit result

        return res.status(200).json({ // Return 200 response with users data
            status: 'OK',
            message: 'Tracks retrieved successfully.',
            tracks,
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while retrieving albums.',
            error: e.message,
        })
    }
}

export const postGetQueue = async (req, res) => {
    try {
        const {queue, onlyAudio} = req.body // Get queue from request body

        if (!queue?.length) return res.status(400).json({ // If queue is empty, return 400 response
            status: 'ERROR',
            message: 'Queue is empty',
        })

        const tracks = await Track.find({_id: {$in: queue}}, !onlyAudio ? {
            audio: 1,
            duration: 1,
            title: 1,
            album: 1,
        } : {
            audio: 1,
        }).populate(!onlyAudio ? {
            path: 'album',
            select: 'cover',
            populate: {
                path: 'artist',
                select: 'name',
            }
        } : null) // Find tracks by IDs and populate album field and populate artist field in album field

        if (!tracks?.length) return res.status(404).json({ // If tracks are not exists, return 404 response
            status: 'ERROR',
            message: 'Tracks are not exists',
        })

        const sortedTracks = [] // Create empty array for sorted tracks
        queue.forEach(id => { // Sort tracks
            const track = tracks.find(t => t._id.toString() === id) // Find track by ID
            if (track) sortedTracks.push(track) // If track is exists, push track to sorted tracks
        })

        return res.status(200).json({ // Send OK response to the client
            status: 'OK',
            message: 'Queue is successfully fetched',
            queue: !onlyAudio ? sortedTracks.map(track => ({
                id: track._id,
                audio: track.audio,
                duration: track.duration,
                title: track.title,
                album: {
                    id: track.album._id,
                    cover: track.album.cover,
                    artist: {
                        name: track.album.artist.name
                    }
                },
            })) : sortedTracks.map(track => ({
                id: track._id,
                audio: track.audio,
            })),
        })
    } catch (e) {
        res.status(500).json({ // Send error response to the client
            status: 'ERROR',
            message: 'An error occurred while getting queue',
            error: e.message,
        })
    }
}

export const getLyrics = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ // If user is not authenticated, return 401 response
            status: 'ERROR',
            message: 'Unauthorized',
        })

        const {id} = req.params // Get track ID from request parameters
        const track = await Track.findById(id) // Find track by ID

        if (!track) return res.status(404).json({ // If track is not exists, return 404 response
            status: 'ERROR',
            message: 'Track is not exists',
        })

        return res.status(200).json({ // Send OK response to the client
            status: 'OK',
            message: 'Track lyrics are successfully fetched',
            lyrics: track.lyrics || null,
        })
    } catch (e) {
        res.status(500).json({ // Send error response to the client
            status: 'ERROR',
            message: e.message,
        })
    }
}

export const getTracks = async (req, res) => {
    try {
        const {cursor, limit: queryLimit, sorting, query} = req.query // Get cursor, limit and sorting from request query
        const escapedQuery = query?.trim()?.length ? escapeRegexp(query?.trim()) : '' // Escape query string

        const sort = sorting === 'first-created' ? {createdAt: 1} :
            sorting === 'last-created' ? {createdAt: -1} :
                sorting === 'first-released' ? {releaseDate: 1} :
                    sorting === 'last-released' ? {releaseDate: -1} :
                        sorting === 'most-popular' ? {plays: -1} :
                            sorting === 'least-popular' ? {plays: 1} :
                        {createdAt: -1} // Get sorting from request query
        const limit = !isNaN(Number(queryLimit)) ? Number(queryLimit) : 0 // Get limit from request query

        let result = []

        if (escapedQuery) { // If query is not empty
            const indexes = index.track.search(escapedQuery) // Search tracks in index
            const combinedTracks = [] // Create empty array for combined tracks

            if (indexes?.length) await new Promise(resolve => { // If indexes are exists and length is not 0 wait for promise
                indexes.forEach(async (index, i) => { // Iterate over indexes
                    if (!combinedTracks.find(t => t._id.toString() === index.item.id)) { // If track is not exists in combined tracks and limit is not reached
                        const track = await Track.findById(index.item.id, 'title album').populate({ // Find track by ID and populate album field
                            path: 'album',
                            select: 'title cover artist',
                            populate: {
                                path: 'artist',
                                select: 'name',
                            }
                        })

                        if (track && !combinedTracks.find(t => t._id.toString() === track._id.toString())) combinedTracks.push(track) // If track is exists and not exists in combined tracks, push track to combined tracks
                        if (i === indexes.length - 1 || (limit && combinedTracks.length === limit)) resolve() // If index is last, resolve promise
                    }
                })
            })

            result = combinedTracks // Set result to combined tracks
        } else { // If query is empty
            result = await Track.find(sorting === 'non-audio' ? {audio: null} : {}, 'title album').sort(sort) // Find all tracks and sort them
                .skip(!isNaN(Number(cursor)) ? cursor : 0) // Skip cursor
                .limit(!isNaN(Number(limit)) ? limit : 0) // Limit result
                .populate({ // Populate album field
                    path: 'album',
                    select: 'title cover',
                    populate: { // Populate artist
                        path: 'artist',
                        select: 'name',
                    },
                })
        }

        return res.status(200).json({ // Send OK response to the client
            status: 'OK',
            message: 'Tracks are successfully fetched',
            tracks: result,
        })
    } catch (e) {
        return res.status(500).json({ // Send error response to the client
            status: 'ERROR',
            message: e.message,
        })
    }
}

export const getTracksByAlbum = async (req, res) => {
    try {
        const {id} = req.params // Get album ID from request parameters
        const {onlyAudio} = req.query // Get onlyAudio from request query

        const album = await Album.findById(id) // Find album by ID

        if (!album) return res.status(404).json({ // If album is not exists, return 404 response
            status: 'ERROR',
            message: 'Album is not exists',
        })

        const tracks = await Track.find({album: album._id}, onlyAudio !== '1' ? {
            audio: 1,
            duration: 1,
            title: 1,
            album: 1,
        } : {
            audio: 1,
            duration: 1,
        }).populate(onlyAudio !== '1' ? {
            path: 'album',
            select: 'cover',
            populate: {
                path: 'artist',
                select: 'name',
            },
        } : null) // Find tracks by album ID and populate album field and populate artist field in album field

        return res.status(200).json({ // Send OK response to the client
            status: 'OK',
            message: 'Tracks are successfully fetched',
            tracks,
        })
    } catch (e) {
        return res.status(500).json({ // Send error response to the client
            status: 'ERROR',
            message: e.message,
        })
    }
}

export const postLike = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ // If user is not authenticated, return 401 response
            status: 'ERROR',
            message: 'Unauthorized',
        })

        const {id} = req.params // Get track ID from request parameters
        const {like} = req.body // Get user ID from request body
        const track = await Track.findById(id) // Find track by ID

        if (!track) return res.status(404).json({ // If track is not exists, return 404 response
            status: 'ERROR',
            message: 'Track is not exists',
        })

        const {user} = req // Get user from request

        if (!user) return res.status(404).json({ // If user is not exists, return 404 response
            status: 'ERROR',
            message: 'User is not exists',
        })

        if (!user?.likedTracks) user.likedTracks = [] // If user's liked tracks is not exists, create empty array
        user.likedTracks = user.likedTracks.filter((t, i) => user.likedTracks.findIndex(t2 => t2.toString() === t.toString()) === i) // Remove duplicate tracks from user's liked tracks


        if (Number(like) === 1 && !user.likedTracks?.find(t => t.toString() === track._id.toString())) user.likedTracks.push(track._id.toString()) // If track is not liked by user, push track to user's liked tracks
        else if (Number(like) === -1 && user.likedTracks?.find(t => t.toString() === track._id.toString())) user.likedTracks = user.likedTracks.filter(t => t.toString() !== track._id.toString()) // If track is liked by user, remove track from user's liked tracks

        await user.save() // Save user

        return res.status(200).json({ // Send OK response to the client
            status: 'OK',
            message: Number(like) === 1 ? 'Track is successfully liked' : 'Track is successfully unliked',
            liked: !!user.likedTracks?.find(t => t.toString() === id),
        })
    } catch (e) {
        return res.status(500).json({ // Send error response to the client
            status: 'ERROR',
            message: e.message,
        })
    }
}