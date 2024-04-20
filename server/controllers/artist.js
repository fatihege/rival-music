import Artist from '../models/artist.js'
import Album from '../models/album.js'
import Track from '../models/track.js'
import User from '../models/user.js'
import escapeRegexp from '../utils/escape-regexp.js'

export const getArtist = async (req, res) => {
    try {
        const {id} = req.params // Get artist ID from request params
        const {user: userId} = req.query // Get user ID from query string

        if (!id) return res.status(400).json({ // If there is no artist ID, return 400 response
            status: 'ERROR',
            message: 'Artist ID is required.',
        })

        const artist = await Artist.findById(id) // Find artist from the artist id

        if (!artist) return res.status(404).json({ // If there is no artist, return 404 response
            status: 'ERROR',
            message: 'Artist not found.',
        })

        let following = false // Is user following artist
        if (userId) { // If there is a user ID, check if user follows artist
            const user = await User.findById(userId) // Find user from the user id

            if (!user) return res.status(404).json({ // If there is no user, return 404 response
                status: 'ERROR',
                message: 'User not found.',
            })

            following = !!user.followedArtists?.find(a => a?.toString() === artist._id.toString()) // Check if user follows artist
        }

        res.status(200).json({ // If there is an artist, return artist info
            status: 'OK',
            artist: {
                ...(artist?._doc || {}),
                ...(userId ? {following} : {}),
            },
        })
    } catch (e) { // If there is an error, return 500 response
        res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving artist info.',
            error: e.message,
        })
    }
}

export const getArtistByGenre = async (req, res) => {
    try {
        const {genre} = req.params // Get genre from request params
        const {limit, sort = 'desc', includes = 'all'} = req.query // Get limit from query string

        if (!genre) return res.status(400).json({ // If there is no genre, return 400 response
            status: 'ERROR',
            message: 'Artist genre is required.',
        })

        const findParam = {genres: {[includes === 'all' ? '$all' : '$in']: genre.split(',')}} // Create find param based on includes query string
        const sortParam = {createdAt: sort === 'desc' ? -1 : 1} // Create sort param based on sort query string

        const artists = await Artist.find(findParam).sort(sortParam).limit(limit && !isNaN(Number(limit)) ? Number(limit) : 0) // Find artists from the artist genre

        res.status(200).json({ // Return artists
            status: 'OK',
            message: 'Artists data retrieved.',
            artists,
        })
    } catch (e) { // If there is an error, return 500 response
        res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving artist info.',
            error: e.message,
        })
    }
}

export const getArtists = async (req, res) => {
    try {
        const {cursor, limit, sorting, query} = req.query // Get cursor, limit and sorting from request query
        const escapedQuery = query?.trim()?.length ? escapeRegexp(query?.trim()) : '' // Escape query string
        const artists = await Artist.find(
            escapedQuery ? { // If there is a query, find artists with query
                $or: [
                    {name: {$regex: escapedQuery, $options: 'i'}},
                    {description: {$regex: escapedQuery, $options: 'i'}},
                    {genres: {$regex: escapedQuery, $options: 'i'}},
                ],
            } : {} // Otherwise, find all artists
        ).sort( // Find artists and sort them
            sorting === 'last-created' ? {createdAt: -1} : // If sorting is last-created, sort by createdAt descending
                sorting === 'first-created' ? {createdAt: 1} : // If sorting is first-created, sort by createdAt ascending
                sorting === 'last-debuted' ? {debutYear: -1} : // If sorting is last-debuted, sort by debutYear descending
                sorting === 'first-debuted' ? {debutYear: 1} : // If sorting is first-debuted, sort by debutYear ascending
                    sorting || null // Otherwise, do not sort
        ).skip(!isNaN(Number(cursor)) ? cursor : 0).limit(!isNaN(Number(limit)) ? limit : 0) // Skip cursor and limit results

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Artists retrieved.',
            artists,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while retrieving artists.',
            error: e.message,
        })
    }
}

export const getIsFollowed = async (req, res) => {
    try {
        const {user} = req // Get user from request

        if (!user) return res.status(401).json({ // If there is no user, return 401 response
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        const {id} = req.params // Get artist ID from request params

        if (!id) return res.status(400).json({ // If there is no artist ID, return 400 response
            status: 'ERROR',
            message: 'Artist ID is required.',
        })

        const artist = await Artist.findById(id) // Find artist from the artist id

        if (!artist) return res.status(404).json({ // If there is no artist, return 404 response
            status: 'ERROR',
            message: 'Artist not found.',
        })

        const isFollowed = !!user.followedArtists?.find(a => a?.toString() === artist._id.toString()) // Check if user follows artist

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Artist info retrieved.',
            isFollowed,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while retrieving artist info.',
            error: e.message,
        })
    }
}

export const getPopularArtists = async (req, res) => {
    try {
        const {limit} = req.query // Get limit from request query

        // Get artists and sort them by followers
        const artists = await Artist.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: 'followedArtists',
                    as: 'users',
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    artist: 1,
                    createdAt: 1,
                    followers: {$size: '$users'},
                },
            },
            {
                $sort: {followers: -1},
            },
            {
                $limit: !isNaN(Number(limit)) ? Number(limit) : 30,
            },
        ])

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Popular artists retrieved.',
            artists,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while retrieving popular artists.',
            error: e.message,
        })
    }
}

export const getArtistEssentials = async (req, res) => {
    try {
        const {id} = req.params // Get artist ID from request params

        if (!id) return res.status(400).json({ // If there is no artist ID, return 400 response
            status: 'ERROR',
            message: 'Artist ID is required.',
        })

        const {user: userId, only} = req.query // Get user ID from query string
        const artist = await Artist.findById(id) // Find artist from the artist id

        if (!artist) return res.status(404).json({ // If there is no artist, return 404 response
            status: 'ERROR',
            message: 'Artist not found.',
        })

        const user = userId ? await User.findById(userId) : null // Find user from the user id
        const albums = await Album.find({artist: artist._id}, {_id: 1}) // Find albums from the artist id

        // Get most listened albums of the artist and sort them by plays
        const mostListenedAlbums = (!only || only === 'albums') ? await Album.aggregate([
            {
                $match: {artist: artist._id},
            },
            {
                $lookup: {
                    from: 'tracks',
                    localField: '_id',
                    foreignField: 'album',
                    as: 'tracks',
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    cover: 1,
                    artist: 1,
                    releaseYear: 1,
                    createdAt: 1,
                    plays: {$size: '$tracks.plays'},
                },
            },
            {
                $sort: {plays: -1},
            },
            {
                $limit: 5,
            },
        ]) : null

        // Get most listened tracks of the artist and sort them by plays
        const mostListenedTracks = (!only || only === 'tracks') ? await Track.find({album: {$in: albums.map(a => a._id)}}).populate({
            path: 'album',
            select: 'title cover audio duration artist',
            populate: {
                path: 'artist',
                select: 'name',
            },
        }).sort({plays: -1}).limit(25) : null

        if (user && mostListenedTracks?.length) { // If there is a user, set is tracks liked by user
            mostListenedTracks.forEach(track => {
                track.liked = !!user.likedTracks?.find(t => t?.toString() === track._id.toString())
            })
        }

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Artist essentials retrieved.',
            essentials: {
                mostListenedAlbums,
                mostListenedTracks,
            },
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while retrieving artist essentials.',
            error: e.message,
        })
    }
}