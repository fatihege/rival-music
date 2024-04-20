import Album from '../models/album.js'
import Artist from '../models/artist.js'
import Track from '../models/track.js'
import User from '../models/user.js'
import escapeRegexp from '../utils/escape-regexp.js'
import index from '../lib/search.js'

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
        let discs = []

        if (tracks) {
            const foundTracks = await Track.find({album: album._id}, 'title explicit audio duration disc order genres') // If tracks query is set, get tracks of the album
            if (foundTracks.length) { // If there are tracks in the album
                discs = foundTracks.reduce((acc, track) => { // Split tracks by disc number
                    if (!acc[track.disc - 1]) acc[track.disc - 1] = [] // If there is no disc, create empty array
                    acc[track.disc - 1].push(track) // Push track to disc
                    return acc // Return accumulator
                }, []).map(disc => disc.sort((a, b) => a.order - b.order)) // Sort tracks by order
            }

            if (likes && userId) { // If likes query is set and there is a user ID
                const user = await User.findById(userId) // Find user from the user ID
                if (user) {
                    if (user.likedAlbums?.find(a => a?.toString() === album?._id?.toString())) liked = true // If user liked the album, set liked to true
                    discs.forEach(disc => { // Map discs
                        disc.forEach(track => { // Map tracks
                            if (user.likedTracks?.find(t => t?.toString() === track?._id?.toString()) && !likedTracks.includes(track?._id?.toString()))
                                likedTracks.push(track?._id?.toString()) // If user liked the track, push track ID to likedTracks array
                        })
                    })
                }
            }
        }

        res.status(200).json({ // If there is an album, return album info
            status: 'OK',
            album: {
                ...(album?._doc || {}),
                ...(tracks ? {discs} : {}),
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
        const sort = sorting === 'last-created' || !sorting ? {createdAt: -1} : // If sorting is last-created, sort by createdAt descending
            sorting === 'first-created' ? {createdAt: 1} : // If sorting is first-created, sort by createdAt ascending
                sorting === 'last-released' ? {releaseYear: -1} : // If sorting is last-released, sort by releaseYear descending
                    sorting === 'first-released' ? {releaseYear: 1} : // If sorting is first-released, sort by releaseYear ascending
                        sorting // Otherwise, default sorting

        let result = []

        if (escapedQuery) { // If query is not empty
            const indexes = index.album.search(escapedQuery, {boost:{title:2}}) // Search albums in index
            const combinedAlbums = [] // Create empty array for combined albums

            if (indexes?.length) await new Promise(resolve => { // If indexes are exists and length is not 0 wait for promise
                indexes.forEach(async (index, i) => { // Iterate over indexes
                    if (!combinedAlbums.find(a => a._id.toString() === index.item.id)) { // If album is not exists in combined albums
                        const album = await Album.findById(index.item.id, 'title cover artist').populate({ // Find album by ID and populate album field
                            path: 'artist',
                            select: 'name',
                        })

                        if (album && !combinedAlbums.find(t => t._id.toString() === album._id.toString())) combinedAlbums.push(album) // If album is exists and not exists in combined albums, push album to combined albums
                        if (i === indexes.length - 1 || limit && combinedAlbums.length === limit) resolve() // If index is last, resolve promise
                    }
                })
            })

            result = combinedAlbums // Set result to combined albums
        } else { // If query is empty
            result = await Album.find({}, 'title cover artist').sort(sort) // Find all tracks and sort them
                .skip(!isNaN(Number(cursor)) ? cursor : 0) // Skip cursor
                .limit(!isNaN(Number(limit)) ? limit : 0) // Limit result
                .populate({ // Populate artist field
                    path: 'artist',
                    select: 'name',
                })
        }

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Albums retrieved.',
            albums: result,
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

export const getPopularAlbums = async (req, res) => {
    try {
        const {limit} = req.query // Get limit from request query

        // Get popular albums from the database and populate artist field
        const albums = await Album.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'likedAlbums',
                    as: 'users',
                },
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'artist',
                    foreignField: '_id',
                    as: 'artist',
                },
            },
            {
                $unwind: {
                    path: '$artist',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    cover: 1,
                    artist: {
                        _id: '$artist._id',
                        name: '$artist.name',
                    },
                    createdAt: 1,
                    likes: {$size: '$users'},
                },
            },
            {
                $sort: {likes: -1},
            },
            {
                $limit: !isNaN(Number(limit)) ? Number(limit) : 30,
            }
        ])

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Popular albums retrieved.',
            albums,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while retrieving popular artists.',
            error: e.message,
        })
    }
}

export const getUserAlbums = async (req, res) => {
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

        const albums = await Album.find({ // Find albums by user's liked albums
            _id: {
                $in: user.likedAlbums || [],
            },
        }).populate({ // Populate artist field
            path: 'artist',
            select: 'name',
        }).skip(!isNaN(Number(cursor)) ? cursor : 0).limit(!isNaN(Number(limit)) ? limit : 0) // Skip cursor and limit results

        return res.status(200).json({ // Return 200 response with users data
            status: 'OK',
            message: 'Albums retrieved successfully.',
            albums,
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while retrieving albums.',
            error: e.message,
        })
    }
}

export const getIsLiked = async (req, res) => {
    try {
        const {id} = req.params // Get album ID from request parameters
        const {user} = req // Get user from request

        if (!user) return res.status(404).json({ // If user is not exists, return 404 response
            status: 'ERROR',
            message: 'User is not exists',
        })

        if (!id) return res.status(400).json({ // If there is no album ID, return 400 response
            status: 'ERROR',
            message: 'Album ID is required.',
        })

        const album = await Album.findById(id) // Find album by ID

        if (!album) return res.status(404).json({ // If album is not exists, return 404 response
            status: 'ERROR',
            message: 'Album is not exists',
        })

        return res.status(200).json({ // Send OK response to the client
            status: 'OK',
            message: 'Album is successfully retrieved',
            isLiked: !!user.likedAlbums?.find(t => t.toString() === album._id.toString()),
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
        if (!req.user) return res.status(401).json({ // If user is not logged in, return 401 response
            status: 'ERROR',
            message: 'Unauthorized',
        })

        const {id} = req.params // Get album ID from request parameters
        const {like} = req.body // Get user ID from request body
        const album = await Album.findById(id) // Find album by ID

        if (!album) return res.status(404).json({ // If album is not exists, return 404 response
            status: 'ERROR',
            message: 'Album is not exists',
        })

        const {user} = req // Get user from request

        if (!user) return res.status(404).json({ // If user is not exists, return 404 response
            status: 'ERROR',
            message: 'User is not exists',
        })

        if (!user?.likedAlbums) user.likedAlbums = [] // If user's liked albums is not exists, create empty array
        user.likedAlbums = user.likedAlbums.filter((t, i) => user.likedAlbums.findIndex(t2 => t2.toString() === t.toString()) === i) // Remove duplicate albums from user's liked albums


        if (Number(like) === 1 && !user.likedAlbums?.find(t => t.toString() === album._id.toString())) user.likedAlbums.push(album._id.toString()) // If album is not liked by user, push album to user's liked albums
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