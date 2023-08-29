import {join} from 'path'
import {createReadStream, existsSync, statSync} from 'fs'
import Track from '../models/track.js'
import Artist from '../models/artist.js'
import Album from '../models/album.js'
import User from '../models/user.js'
import client from '../lib/redis.js'
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
        const {lyrics = null, populate = null, user: userId = null} = req.query // Get populate from request query

        if (!id) return res.status(400).json({ // If there is no track ID, return 400 response
            status: 'ERROR',
            message: 'Track ID is required',
        })

        // Get track and populate its album field and populate artist field in album field
        const track = await Track.findById(id)
            .select(Number(lyrics) !== 1 ?'-lyrics' : '')
            .populate({
            path: 'album',
            select: `title cover ${populate === 'all' ? '' : ''}`,
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
        const {cursor, limit, sorting, query} = req.query // Get cursor, limit and sorting from request query
        const escapedQuery = query?.trim()?.length ? escapeRegexp(query?.trim()) : '' // Escape query string
        const keywords = escapedQuery ? escapedQuery?.split(' ') : '' // Split query string by space

        const sort = sorting === 'first-created' ? {createdAt: 1} :
            sorting === 'last-created' ? {createdAt: -1} :
                sorting === 'first-released' ? {releaseDate: 1} :
                    sorting === 'last-released' ? {releaseDate: -1} :
                        {createdAt: -1} // Get sorting from request query

        const tracks = escapedQuery ? await Track.aggregate([ // Get tracks from database
            {
                $match: escapedQuery ? {
                    $or: [
                        {title: {$regex: keywords.join('|'), $options: 'i'}},
                        {genres: {$in: keywords}},
                        {
                            album: {
                                $in: (await Album.find({
                                    title: {$regex: keywords.join('|'), $options: 'i'},
                                }))?.map(a => a._id)
                            }
                        },
                        {
                            album: {
                                $in: (await Album.find({
                                    artist: {
                                        $in: (await Artist.find({
                                            name: {$regex: keywords.join('|'), $options: 'i'},
                                        }))?.map(a => a._id)
                                    }
                                }))?.map(a => a._id)
                            }
                        },
                    ],
                } : {},
            },
            {
                $lookup: {
                    from: 'albums',
                    localField: 'album',
                    foreignField: '_id',
                    as: 'album',
                }
            },
            {
                $unwind: '$album',
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'album.artist',
                    foreignField: '_id',
                    as: 'album.artist',
                }
            },
            {
                $unwind: '$album.artist',
            },
            {
                $project: {
                    title: 1,
                    album: {
                        _id: '$album._id',
                        title: '$album.title',
                        cover: '$album.cover',
                        artist: {
                            _id: '$album.artist._id',
                            name: '$album.artist.name',
                        },
                    },
                },
            },
            {
                $sort: sort,
            },
            {
                $skip: cursor && !isNaN(Number(cursor)) ? Number(cursor) : 0,
            },
            {
                $limit: limit && !isNaN(Number(limit)) ? Number(limit) : 0,
            },
        ]).exec() : await Track.find().sort(sort)
            .skip(!isNaN(Number(cursor)) ? cursor : 0)
            .limit(!isNaN(Number(limit)) ? limit : 0) // Skip cursor and limit results
            .populate({ // Populate album
                path: 'album',
                select: 'title cover',
                populate: { // Populate artist
                    path: 'artist',
                    select: 'name',
                },
            })

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
            message:  Number(like) === 1 ? 'Track is successfully liked' : 'Track is successfully unliked',
            liked: !!user.likedTracks?.find(t => t.toString() === id),
        })
    } catch (e) {
        return res.status(500).json({ // Send error response to the client
            status: 'ERROR',
            message: e.message,
        })
    }
}