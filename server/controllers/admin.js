import {unlink} from 'fs'
import {join} from 'path'
import User from '../models/user.js'
import Artist from '../models/artist.js'
import Album from '../models/album.js'
import Track from '../models/track.js'
import Playlist from '../models/playlist.js'
import {__dirname} from '../utils/dirname.js'

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
        const banner = req.files?.banner ? req.files?.banner[0]?.filename : null // Get banner filename
        const profile = req.files?.profile ? req.files?.profile[0]?.filename : null // Get profile picture filename
        const {name, description, genres: genresString} = req.body // Get name, description and genres from request body

        if (!name?.trim()?.length) return res.status(400).json({ // If name is empty, return 400 response
            status: 'ERROR',
            message: 'Artist name is required.',
        })

        const genres = genresString.split(',').filter(g => g?.trim() !== '').map(g => g?.toLowerCase()) // Split genres string and remove empty genres
        const artist = new Artist({ // Create new artist
            banner,
            image: profile,
            name: name.trim(),
            description: description?.trim()?.length ? description.trim() : null,
            genres,
        })

        await artist.save() // Save artist to database

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Artist created.',
            id: artist._id,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while creating artist.',
            error: e.message,
        })
    }
}

export const postUpdateArtist = async (req, res) => {
    try {
        const {id} = req.params // Get artist ID from request params
        const banner = req.files?.banner ? req.files?.banner[0]?.filename : null // Get banner filename
        const profile = req.files?.profile ? req.files?.profile[0]?.filename : null // Get profile picture filename
        const {name, description, genres: genresString, noBanner, noProfile} = req.body // Get name, description and genres from request body

        if (!id?.trim()?.length) return res.status(400).json({ // If ID is empty, return 400 response
            status: 'ERROR',
            message: 'Artist ID is required.',
        })

        const artist = await Artist.findById(id) // Find artist by ID

        if (!artist) return res.status(404).json({ // If artist is not found, return 404 response
            status: 'ERROR',
            message: 'Artist not found.',
        })

        if ((banner && artist.banner) || (noBanner && artist.banner)) await unlink(join(__dirname, '..', 'public', 'uploads', artist.banner), () => {}) // Delete old banner
        if ((profile && artist.image) || (noProfile && artist.image)) await unlink(join(__dirname, '..', 'public', 'uploads', artist.image), () => {}) // Delete old profile picture

        if (noBanner) artist.banner = null // Remove banner
        else if (banner) artist.banner = banner // Update banner

        if (profile) artist.image = profile // Update profile picture
        else if (noProfile) artist.image = null // Remove profile picture

        if (name?.trim()?.length) artist.name = name.trim() // Update name
        if (description?.trim()?.length) artist.description = description.trim() // Update description
        if (genresString?.trim()?.length) artist.genres = genresString.split(',').filter(g => g?.trim() !== '').map(g => g?.toLowerCase()) // Update genres

        await artist.save() // Save artist to database

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Artist updated.',
            id: artist._id,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while updating artist.',
            error: e.message,
        })
    }
}

export const deleteArtist = async (req, res) => {
    try {
        const {id} = req.params // Get artist ID from request params

        if (!id?.trim()?.length) return res.status(400).json({ // If ID is empty, return 400 response
            status: 'ERROR',
            message: 'Artist ID is required.',
        })

        const artist = await Artist.findById(id) // Find artist by ID

        if (!artist) return res.status(404).json({ // If artist is not found, return 404 response
            status: 'ERROR',
            message: 'Artist not found.',
        })

        if (artist.banner) await unlink(join(__dirname, '..', 'public', 'uploads', artist.banner), () => {}) // Delete banner
        if (artist.image) await unlink(join(__dirname, '..', 'public', 'uploads', artist.image), () => {}) // Delete profile picture

        await artist.deleteOne() // Delete artist from database

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Artist deleted.',
            id: artist._id,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while deleting artist.',
            error: e.message,
        })
    }
}