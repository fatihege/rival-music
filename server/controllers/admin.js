import {unlink} from 'fs'
import {join} from 'path'
import User from '../models/user.js'
import Artist from '../models/artist.js'
import Album from '../models/album.js'
import Track from '../models/track.js'
import Playlist from '../models/playlist.js'
import convertDuration from '../utils/convert-duration.js'
import createManifest from '../utils/create-manifest.js'
import {__dirname} from '../utils/dirname.js'
import deleteAudio from '../utils/delete-audio.js'

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
                nonAudioTracks: tracks - (await Track.count({audio: {$ne: null}})), // Count all tracks without audio
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

export const postCreateTrack = async (req, res) => {
    try {
        const audio = req?.file?.filename || null // Get audio filename
        const {title, explicit, album, artists: artistsString, duration, order, genres: genresString, lyrics: lyricsString} = req.body // Get title, album, duration, order, genres and lyrics from request body

        if (!title?.trim()?.length) return res.status(400).json({ // If title is empty, return 400 response
            status: 'ERROR',
            message: 'Track title is required.',
        })

        if (!album?.trim()?.length) return res.status(400).json({ // If album is empty, return 400 response
            status: 'ERROR',
            message: 'Track album ID is required.',
        })

        const artists = artistsString?.split(',')?.filter(a => a?.trim()?.length)?.length ? artistsString.split(',').filter(a => a?.trim()?.length) : null

        if (artists?.length) {
            const foundArtists = await Artist.find({_id: {$in: artists}}) // Find artists by ID

            if (foundArtists.length !== artists.length) return res.status(404).json({ // If artists are not found, return 404 response
                status: 'ERROR',
                message: 'Artist not found.',
            })
        }

        const foundAlbum = await Album.findById(album) // Find album by ID

        if (!foundAlbum) return res.status(404).json({ // If album is not found, return 404 response
            status: 'ERROR',
            message: 'Album not found.',
        })

        const genres = genresString.split(',').filter(g => g?.trim() !== '').map(g => g?.toLowerCase()?.trim()) // Split genres string and remove empty genres
        let lyrics = []

        try {
            lyrics = JSON.parse(lyricsString) // Parse lyrics string
            if (!Array.isArray(lyrics)) throw new Error('Lyrics must be an array.') // If lyrics is not an array, throw error

            lyrics = lyrics.map(l => ({ // Map lyrics
                start: convertDuration(l.start),
                text: l.text,
            }))
        } catch (e) {
            return res.status(400).json({ // If there is an error, return 400 response
                status: 'ERROR',
                message: 'Lyrics must be an array.',
                error: e.message,
            })
        }

        const track = new Track({ // Create new track
            audio,
            title: title.trim(),
            explicit: explicit === '1',
            album,
            artists: artists || null,
            duration: parseInt(duration),
            order: parseInt(order),
            genres,
            lyrics,
        })

        await track.save() // Save track to database

        if (audio) {
            const audioPath = join(__dirname, '..', 'audio', audio)
            const {err} = await createManifest(audioPath, join(__dirname, '..', 'audio', 'manifest', audio.slice(0, audio.lastIndexOf('.')))) // Create manifest file
            if (!err) await unlink(audioPath, () => {}) // Delete audio file
        }

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Track created.',
            id: track._id,
            album: foundAlbum._id,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while creating track.',
            error: e.message,
        })
    }
}

export const postUpdateTrack = async (req, res) => {
    try {
        const {id} = req.params // Get track ID from request params
        const audio = req?.file?.filename || null // Get audio filename
        const {
            title,
            explicit,
            album,
            artists: artistsString,
            duration,
            order,
            genres: genresString,
            lyrics: lyricsString,
            noAudio
        } = req.body // Get title, album, duration, order, genres and lyrics from request body

        if (!id?.trim()?.length) return res.status(400).json({ // If ID is empty, return 400 response
            status: 'ERROR',
            message: 'Track ID is required.',
        })

        if (isNaN(Number(duration))) return res.status(400).json({ // If duration is not a number, return 400 response
            status: 'ERROR',
            message: 'Track duration must be a number.',
        })

        if (isNaN(Number(order))) return res.status(400).json({ // If order is not a number, return 400 response
            status: 'ERROR',
            message: 'Track order must be a number.',
        })

        const artists = artistsString?.split(',')?.filter(a => a?.trim()?.length)?.length ? artistsString.split(',').filter(a => a?.trim()?.length) : null

        if (artists?.length) {
            const foundArtists = await Artist.find({_id: {$in: artists}}) // Find artists by ID

            if (foundArtists.length !== artists.length) return res.status(404).json({ // If artists are not found, return 404 response
                status: 'ERROR',
                message: 'Artist not found.',
            })
        }

        const foundAlbum = await Album.findById(album) // Find album by ID

        if (!foundAlbum) return res.status(404).json({ // If album is not found, return 404 response
            status: 'ERROR',
            message: 'Album not found.',
        })

        const track = await Track.findById(id) // Find track by ID

        if (!track) return res.status(404).json({ // If track is not found, return 404 response
            status: 'ERROR',
            message: 'Track not found.',
        })

        if (title?.trim()?.length) track.title = title.trim() // Update title
        if (explicit === '1' || explicit === '0') track.explicit = explicit === '1' // Update explicit
        if (album?.trim()?.length) track.album = foundAlbum._id // Update album
        track.artists = artists || null // Update artists
        if (duration?.trim()?.length && !isNaN(Number(duration))) track.duration = Number(duration) // Update duration
        if (order?.trim()?.length && !isNaN(Number(order))) track.order = Number(order) // Update order
        if (genresString?.trim()?.length) track.genres = genresString.split(',').filter(g => g?.trim() !== '').map(g => g?.toLowerCase()?.trim()) // Update genres

        let lyrics = []

        try {
            lyrics = JSON.parse(lyricsString) // Parse lyrics string
            if (!Array.isArray(lyrics)) throw new Error('Lyrics must be an array.') // If lyrics is not an array, throw error

            lyrics = lyrics.map(l => ({ // Map lyrics
                start: convertDuration(l.start),
                text: l.text,
            }))
        } catch (e) {
            return res.status(400).json({ // If there is an error, return 400 response
                status: 'ERROR',
                message: 'Lyrics must be an array.',
                error: e.message,
            })
        }

        track.lyrics = lyrics // Update lyrics

        if (audio) {
            if (track.audio)
                try {
                    await deleteAudio(track.audio)
                } catch (e) {}

            const audioPath = join(__dirname, '..', 'audio', audio)
            const {err} = await createManifest(audioPath, join(__dirname, '..', 'audio', 'manifest', audio.slice(0, audio.lastIndexOf('.')))) // Create manifest file
            if (!err) await unlink(audioPath, () => {}) // Delete audio file
            track.audio = audio
        } else if (noAudio) {
            try {
                await deleteAudio(track.audio)
            } catch (e) {}
            track.audio = null
        }

        await track.save() // Save track to database

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Track updated.',
            id: track._id,
            album: track.album._id,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while updating track.',
            error: e.message,
        })
    }
}

export const deleteTrack = async (req, res) => {
    try {
        const {id} = req.params // Get track ID from request params

        if (!id?.trim()?.length) return res.status(400).json({ // If ID is empty, return 400 response
            status: 'ERROR',
            message: 'Track ID is required.',
        })

        const track = await Track.findById(id) // Find track by ID

        if (!track) return res.status(404).json({ // If track is not found, return 404 response
            status: 'ERROR',
            message: 'Track not found.',
        })

        try {
            if (track.audio) await deleteAudio(track.audio)
        } catch (e) {}

        await track.deleteOne() // Delete track from database

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Track deleted.',
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while deleting track.',
            error: e.message,
        })
    }
}