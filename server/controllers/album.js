import Album from '../models/album.js'
import Artist from '../models/artist.js'
import Track from '../models/track.js'
import User from '../models/user.js'
import escapeRegexp from '../utils/escape-regexp.js'

export const getAlbum = async (req, res) => {
    try {
        const {id} = req.params // Get album ID from request params
        const {tracks, likes, user: userId, populate} = req.query // Get populate from request query

        if (!id) return res.status(400).json({ // If there is no album ID, return 400 response
            status: 'ERROR',
            message: 'Album ID is required.',
        })

        const album = await Album.findById(id).populate({ // Find album from the album ID
            path: 'artist',
            select: `name image ${populate === 'all' ? 'genres' : ''}`,
        })

        if (!album) return res.status(404).json({ // If there is no album, return 404 response
            status: 'ERROR',
            message: 'Album not found.',
        })

        let likedTracks = []
        let liked = false

        if (tracks) {
            album.tracks = await Track.find({album: album._id}, {lyrics: 0}) // If tracks query is set, get tracks of the album
            if (album.tracks.length) album.tracks = album.tracks.sort((a, b) => a.order - b.order) // If there is tracks, sort them

            if (likes && userId) { // If likes query is set and there is a user ID
                const user = await User.findById(userId) // Find user from the user ID
                if (user) {
                    if (user.likedAlbums?.find(a => a.toString() === album._id.toString())) liked = true // If user liked the album, set liked to true
                    album.tracks.forEach(track => { // Map tracks
                        if (user.likedTracks?.find(t => t.toString() === track._id.toString()) && !likedTracks.includes(track._id.toString()))
                            likedTracks.push(track._id.toString()) // If user liked the track, push track ID to likedTracks array
                    })
                }
            }
        }

        res.status(200).json({ // If there is an album, return album info
            status: 'OK',
            album: {
                ...(album?._doc || {}),
                ...(likes ? {
                    likes: likedTracks,
                    liked,
                } : {})
            },
        })
    } catch (e) { // If there is an error, return 500 response
        res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving album info.',
            error: e.message,
        })
    }
}

export const getAlbums = async (req, res) => {
    try {
        const {cursor, limit, sorting, query} = req.query // Get cursor, limit and sorting from request query
        const escapedQuery = query?.trim()?.length ? escapeRegexp(query?.trim()) : '' // Escape query string
        const keywords = escapedQuery ? escapedQuery.split(' ') : [] // Create keywords from escaped query string
        const sort = sorting === 'last-created' || !sorting ? {createdAt: -1} : // If sorting is last-created, sort by createdAt descending
            sorting === 'first-created' ? {createdAt: 1} : // If sorting is first-created, sort by createdAt ascending
                sorting === 'last-released' ? {releaseYear: -1} : // If sorting is last-released, sort by releaseYear descending
                    sorting === 'first-released' ? {releaseYear: 1} : // If sorting is first-released, sort by releaseYear ascending
                        sorting // Otherwise, default sorting
        const albums = escapedQuery ? await Album.aggregate([
            {
                $match: escapedQuery ? { // If there is a query, find album with query
                    $or: [
                        {title: {$regex: keywords.join('|'), $options: 'i'}},
                        {genres: {$regex: keywords.join('|'), $options: 'i'}},
                        {
                            artist: {
                                $in: (await Artist.find({
                                    name: {$regex: keywords.join('|'), $options: 'i'},
                                }))?.map(a => a._id)
                            }
                        }
                    ],
                } : {} // Otherwise, find all artists
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'artist',
                    foreignField: '_id',
                    as: 'artist',
                }
            },
            {
                $unwind: '$artist'
            },
            {
                $project: {
                    title: 1,
                    cover: 1,
                    releaseYear: 1,
                    genres: 1,
                    artist: {
                        _id: '$artist._id',
                        name: '$artist.name',
                    },
                }
            },
            {
                $sort: sort
            },
            {
                $skip: cursor && !isNaN(Number(cursor)) ? Number(cursor) : 0
            },
            {
                $limit: limit && !isNaN(Number(limit)) ? Number(limit) : 0
            }
        ]).exec() : await Album.find().sort(sort)
            .skip(!isNaN(Number(cursor)) ? cursor : 0)
            .limit(!isNaN(Number(limit)) ? limit : 0) // Skip cursor and limit results
            .populate({ // Populate artist
                path: 'artist',
                select: `name`,
            })

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Albums retrieved.',
            albums,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while retrieving albums.',
            error: e.message,
        })
    }
}

export const getAlbumsByArtist = async (req, res) => {
    try {
        const {id} = req.params

        if (!id) return res.status(400).json({ // If there is no artist ID, return 400 response
            status: 'ERROR',
            message: 'Artist ID is required.',
        })

        const {cursor, limit, sorting, query, populate = ''} = req.query // Get cursor, limit and sorting from request query
        const escapedQuery = query?.trim()?.length ? escapeRegexp(query?.trim()) : '' // Escape query string
        const albums = await Album.find(
            escapedQuery ? { // If there is a query, find album with query
                $or: [
                    {title: {$regex: escapedQuery, $options: 'i'}},
                    {genres: {$regex: escapedQuery, $options: 'i'}},
                    {
                        artist: {
                            $eq: (await Artist.findById(id))
                        }
                    }
                ],
            } : { // Otherwise, find albums by artist
                artist: {
                    $eq: (await Artist.findById(id))
                }
            }
        ).sort( // Find artists and sort them
            sorting === 'last-created' ? {createdAt: -1} : // If sorting is last-created, sort by createdAt descending
                sorting === 'first-created' ? {createdAt: 1} : // If sorting is first-created, sort by createdAt ascending
                    sorting === 'last-released' ? {releaseYear: -1} : // If sorting is last-released, sort by releaseYear descending
                        sorting === 'first-released' ? {releaseYear: 1} : // If sorting is first-released, sort by releaseYear ascending
                            sorting || null // Otherwise, do not sort
        ).skip(!isNaN(Number(cursor)) ? cursor : 0).limit(!isNaN(Number(limit)) ? limit : 0) // Skip cursor and limit results
            .populate({
                path: 'artist',
                select: `name image ${populate === 'all' ? 'description genres' : populate || ''}`,
            })

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Albums retrieved.',
            albums,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while retrieving albums.',
            error: e.message,
        })
    }
}

export const postLike = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ // If user is not logged in, return 401 response
            status: 'ERROR',
            message: 'Unauthorized',
        })

        const {id} = req.params // Get album ID from request parameters
        const {like} = req.body // Get user ID from request body
        const album = await Album.findById(id) // Find album by ID

        if (!album) return res.status(404).json({ // If track is not exists, return 404 response
            status: 'ERROR',
            message: 'Album is not exists',
        })

        const {user} = req // Get user from request

        if (!user) return res.status(404).json({ // If user is not exists, return 404 response
            status: 'ERROR',
            message: 'User is not exists',
        })

        if (!user?.likedAlbums) user.likedAlbums = [] // If user's liked albums is not exists, create empty array
        user.likedAlbums = user.likedAlbums.filter((t, i) => user.likedAlbums.findIndex(t2 => t2.toString() === t.toString()) === i) // Remove duplicate tracks from user's liked albums


        if (Number(like) === 1 && !user.likedAlbums?.find(t => t.toString() === album._id.toString())) user.likedAlbums.push(album._id.toString()) // If album is not liked by user, push album to user's liked album
        else if (Number(like) === -1 && user.likedAlbums?.find(t => t.toString() === album._id.toString())) user.likedAlbums = user.likedAlbums.filter(t => t.toString() !== album._id.toString()) // If album is liked by user, remove album from user's liked albums

        await user.save() // Save user

        return res.status(200).json({ // Send OK response to the client
            status: 'OK',
            message: Number(like) === 1 ? 'Album is successfully liked' : 'Album is successfully unliked',
            liked: !!user.likedAlbums?.find(t => t.toString() === album._id.toString()),
        })
    } catch (e) {
        return res.status(500).json({ // Send error response to the client
            status: 'ERROR',
            message: e.message,
        })
    }
}