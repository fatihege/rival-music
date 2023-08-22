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

        const genres = genresString.split(',').filter(g => g?.trim() !== '').map(g => g?.toLowerCase()?.trim()) // Split genres string and remove empty genres
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
        if (genresString?.trim()?.length) artist.genres = genresString.split(',').filter(g => g?.trim() !== '').map(g => g?.toLowerCase()?.trim()) // Update genres

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

export const postCreateAlbum = async (req, res) => {
    try {
        const cover = req.file?.filename // Get cover filename
        const {title, releaseYear, artist, genres: genresString} = req.body // Get title, release year and genres from request body

        if (!title?.trim()?.length) return res.status(400).json({ // If title is empty, return 400 response
            status: 'ERROR',
            message: 'Album title is required.',
        })

        if (!artist?.trim()?.length) return res.status(400).json({ // If artist is empty, return 400 response
            status: 'ERROR',
            message: 'Album artist ID is required.',
        })

        const foundArtist = await Artist.findById(artist) // Find artist by ID

        if (!foundArtist) return res.status(404).json({ // If artist is not found, return 404 response
            status: 'ERROR',
            message: 'Artist not found.',
        })

        const genres = genresString.split(',').filter(g => g?.trim() !== '').map(g => g?.toLowerCase()?.trim()) // Split genres string and remove empty genres
        const album = new Album({ // Create new album
            cover,
            title: title.trim(),
            releaseYear: releaseYear?.trim()?.length ? releaseYear.trim() : null,
            artist,
            genres,
        })

        await album.save() // Save album to database

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Album created.',
            id: album._id,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while creating album.',
            error: e.message,
        })
    }
}

export const postUpdateAlbum = async (req, res) => {
    try {
        const {id} = req.params // Get album ID from request params
        const cover = req.file?.filename // Get cover filename
        const {title, releaseYear, artist, genres: genresString, noCover} = req.body // Get title, release year and genres from request body

        if (!id?.trim()?.length) return res.status(400).json({ // If ID is empty, return 400 response
            status: 'ERROR',
            message: 'Album ID is required.',
        })

        if (isNaN(Number(releaseYear))) return res.status(400).json({ // If release year is not a number, return 400 response
            status: 'ERROR',
            message: 'Album release year must be a number.',
        })

        const album = await Album.findById(id) // Find album by ID

        if (!album) return res.status(404).json({ // If album is not found, return 404 response
            status: 'ERROR',
            message: 'Album not found.',
        })

        if ((cover && album.cover) || (noCover && album.cover)) await unlink(join(__dirname, '..', 'public', 'uploads', album.cover), () => {}) // Delete old cover

        if (noCover) album.cover = null // Remove cover
        else if (cover) album.cover = cover // Update cover

        if (title?.trim()?.length) album.title = title.trim() // Update title
        if (releaseYear?.trim()?.length && !isNaN(Number(releaseYear))) album.releaseYear = Number(releaseYear) // Update release year
        if (artist?.trim()?.length) album.artist = artist.trim() // Update artist
        if (genresString?.trim()?.length) album.genres = genresString.split(',').filter(g => g?.trim() !== '').map(g => g?.toLowerCase()?.trim()) // Update genres

        await album.save() // Save album to database

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Album updated.',
            id: album._id,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while updating album.',
            error: e.message,
        })
    }
}

export const deleteAlbum = async (req, res) => {
    try {
        const {id} = req.params // Get album ID from request params

        if (!id?.trim()?.length) return res.status(400).json({ // If ID is empty, return 400 response
            status: 'ERROR',
            message: 'Album ID is required.',
        })

        const album = await Album.findById(id) // Find album by ID

        if (!album) return res.status(404).json({ // If album is not found, return 404 response
            status: 'ERROR',
            message: 'Album not found.',
        })

        if (album.cover) await unlink(join(__dirname, '..', 'public', 'uploads', album.cover), () => {}) // Delete cover

        await album.deleteOne() // Delete album from database

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Album deleted.',
            id: album._id,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while deleting album.',
            error: e.message,
        })
    }
}