import User from '../models/user.js'
import Artist from '../models/artist.js'
import Album from '../models/album.js'
import Track from '../models/track.js'
import Playlist from '../models/playlist.js'

export const getStatistics = async (req, res) => {
    try {
        const users = await User.count() // Count all users
        const artists = await Artist.count() // Count all artists
        const albums = await Album.count() // Count all albums
        const tracks = await Track.count() // Count all tracks
        const playlists = await Playlist.count() // Count all playlists

        return res.status(200).json({ // Return statistics
            status: 'OK',
            message: 'Data retrieved.',
            data: {
                users,
                artists,
                albums,
                tracks,
                playlists,
            },
        })
    } catch (e) { // If there is an error, return 500 response
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error occurred while retrieving data.',
            error: e.message,
        })
    }
}

export const postCreateArtist = async (req, res) => {
    try {
        const banner = req.files?.banner ? req.files?.banner[0]?.filename : null
        const profile = req.files?.profile ? req.files?.profile[0]?.filename : null
        const {name, description, genres: genresString} = req.body

        if (!name?.trim()?.length) return res.status(400).json({
            status: 'ERROR',
            message: 'Artist name is required.',
        })

        const genres = genresString.split(',').filter(g => g?.trim() !== '').map(g => g?.toLowerCase())
        const artist = new Artist({
            banner,
            image: profile,
            name: name.trim(),
            description: description?.trim()?.length ? description.trim() : null,
            genres,
        })

        await artist.save()

        return res.status(200).json({
            status: 'OK',
            message: 'Artist created.',
            id: artist._id,
        })
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error occurred while creating artist.',
            error: e.message,
        })
    }
}