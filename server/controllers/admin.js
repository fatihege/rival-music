import {unlink} from 'fs'
import {join} from 'path'
import App from '../models/app.js'
import User from '../models/user.js'
import Artist from '../models/artist.js'
import Album from '../models/album.js'
import Track from '../models/track.js'
import Playlist from '../models/playlist.js'
import Request from '../models/request.js'
import convertDuration from '../utils/convert-duration.js'
import createManifest from '../utils/create-manifest.js'
import {__dirname} from '../utils/dirname.js'
import deleteAudio from '../utils/delete-audio.js'
import index from '../lib/search.js'
import escapeRegexp from '../utils/escape-regexp.js'

export const getStatistics = async (req, res) => {
    try {
        const users = await User.count() // Count all users
        const artists = await Artist.count() // Count all artists
        const albums = await Album.count() // Count all albums
        const tracks = await Track.count() // Count all tracks
        const playlists = await Playlist.count() // Count all playlists
        const app = await App.findOne().select('exploreGenres') // Get explore genres

        return res.status(200).json({ // Return statistics
            status: 'OK',
            message: 'Data retrieved.',
            data: {
                users,
                waitingUsers: await User.count({accepted: false, admin: false}), // Count all waiting users
                artists,
                albums,
                tracks,
                nonAudioTracks: tracks - (await Track.count({audio: {$ne: null}})), // Count all tracks without audio
                playlists,
                genres: app.exploreGenres?.length,
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
        const banner = req.files?.banner ? req.files?.banner?.[0]?.filename : null // Get banner filename
        const profile = req.files?.profile ? req.files?.profile?.[0]?.filename : null // Get profile picture filename
        const {name, description, debutYear, genres: genresString} = req.body // Get name, description and genres from request body

        if (!name?.trim()?.length) return res.status(400).json({ // If name is empty, return 400 response
            status: 'ERROR',
            message: 'Artist name is required.',
        })

        if (isNaN(Number(debutYear))) return res.status(400).json({ // If debut year is not a number, return 400 response
            status: 'ERROR',
            message: 'Artist debut year must be a number.',
        })

        const genres = genresString.split(',').filter(g => g?.trim() !== '').map(g => g?.toLowerCase()?.trim()) // Split genres string and remove empty genres
        const artist = new Artist({ // Create new artist
            banner,
            image: profile,
            name: name.trim(),
            description: description?.trim()?.length ? description.trim() : null,
            debutYear: Number(debutYear),
            genres,
        })

        await artist.save() // Save artist to database

        index.artist.add({
            id: artist._id.toString(),
            name: artist.name,
        }) // Add artist to index

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
        const banner = req.files?.banner ? req.files?.banner?.[0]?.filename : null // Get banner filename
        const profile = req.files?.profile ? req.files?.profile?.[0]?.filename : null // Get profile picture filename
        const {name, description, debutYear, genres: genresString, noBanner, noProfile} = req.body // Get name, description and genres from request body

        if (!id?.trim()?.length) return res.status(400).json({ // If ID is empty, return 400 response
            status: 'ERROR',
            message: 'Artist ID is required.',
        })

        if (isNaN(Number(debutYear))) return res.status(400).json({ // If debut year is not a number, return 400 response
            status: 'ERROR',
            message: 'Artist debut year must be a number.',
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
        if (debutYear?.trim()?.length && !isNaN(Number(debutYear))) artist.debutYear = Number(debutYear) // Update debut year
        if (genresString?.trim()?.length) artist.genres = genresString.split(',').filter(g => g?.trim() !== '').map(g => g?.toLowerCase()?.trim()) // Update genres

        await artist.save() // Save artist to database

        index.artist.remove(doc => doc.id === artist._id.toString()) // Remove artist from index
        index.artist.add({
            id: artist._id.toString(),
            name: artist.name,
        }) // Update artist in index

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

        index.artist.remove(doc => doc.id === artist._id.toString()) // Remove artist from index
        await artist.deleteOne() // Delete artist from database

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Artist deleted.',
            id: artist._id.toString(),
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

        index.album.add({
            id: album._id.toString(),
            title: album.title,
            artist: foundArtist.name,
        }) // Add album to index

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

        index.album.remove(doc => doc.id === album._id.toString()) // Remove album from index
        index.album.add({
            id: album._id.toString(),
            title: album.title,
            artist: album.artist?.name,
        }) // Update album in index

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

        index.album.remove(doc => doc.id === album._id.toString()) // Remove album from index
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
        const {title, explicit, album, artists: artistsString, duration, disc, order, genres: genresString, lyrics: lyricsString} = req.body // Get title, album, duration, order, genres and lyrics from request body

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
            disc: disc && parseInt(disc) > 0 ? parseInt(disc) : 1,
            order: parseInt(order),
            genres,
            lyrics,
        })

        await track.save() // Save track to database

        index.track.add({
            id: track._id.toString(),
            title: track.title,
            album: foundAlbum.title,
            artist: foundAlbum.artist.name,
        }) // Add track to index

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
            disc,
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
        if (disc?.trim()?.length && !isNaN(Number(disc))) track.disc = Number(disc) // Update disc
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

        index.track.remove(doc => doc.id === track._id.toString()) // Remove track from index
        index.track.add({
            id: track._id.toString(),
            title: track.title,
            album: foundAlbum.title,
            artist: foundAlbum.artist.name,
        }) // Update track in index

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

        index.track.remove(doc => doc.id === track._id.toString()) // Remove track from index
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

export const postGenres = async (req, res) => {
    try {
        const {genres: genresString} = req.body // Get genres from request body
        const genres = genresString.split(',').filter(g => g?.trim() !== '').map(g => g?.toLowerCase()?.trim()) // Split genres string and remove empty genres

        await App.updateOne({}, {
            $set: {exploreGenres: genres}
        })

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Genres updated.',
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while updating genres.',
            error: e.message,
        })
    }
}

export const getAcceptance = async (req, res) => {
    try {
        const app = await App.findOne() // Get app data

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Acceptance retrieved.',
            acceptance: app.usersMustAccepted,
        })
    } catch (e) { // If there is an error, return 500 response
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error occurred while retrieving acceptance.',
            error: e.message,
        })
    }
}

export const postAcceptance = async (req, res) => {
    try {
        const {acceptance} = req.body // Get acceptance from request body

        await App.updateOne({}, {
            $set: {usersMustAccepted: acceptance}
        })

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Acceptance updated.',
        })
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error occurred while updating acceptance.',
            error: e.message,
        })
    }
}

export const getRequests = async (req, res) => {
    try {
        const {cursor, limit, sorting, query} = req.query // Get cursor, limit and sorting from request query
        const escapedQuery = query?.trim()?.length ? escapeRegexp(query?.trim()) : '' // Escape query string
        const requests = await Request.find(
            escapedQuery ? // If there is a query, find requests with query
                {content: {$regex: escapedQuery, $options: 'i'}} : {} // Otherwise, find all requests
        ).populate({
            path: 'user',
            select: 'name email',
        }).sort( // Find requests and sort them
            sorting === 'last-created' ? {createdAt: -1} : // If sorting is last-created, sort by createdAt descending
                sorting === 'first-created' ? {createdAt: 1} : // If sorting is first-created, sort by createdAt ascending
                    null // Otherwise, do not sort
        ).skip(!isNaN(Number(cursor)) ? cursor : 0).limit(!isNaN(Number(limit)) ? limit : 0) // Skip cursor and limit results

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Requests retrieved.',
            requests,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while retrieving requests.',
            error: e.message,
        })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const {id} = req.params // Get user ID from request params

        if (!id?.trim()?.length) return res.status(400).json({ // If ID is empty, return 400 response
            status: 'ERROR',
            message: 'User ID is required.',
        })

        if (id === req.user._id.toString()) return res.status(400).json({ // If ID is empty, return 400 response
            status: 'ERROR',
            message: 'You cannot delete yourself.',
        })

        const user = await User.findById(id) // Find user by ID

        if (!user) return res.status(404).json({ // If user is not found, return 404 response
            status: 'ERROR',
            message: 'User not found.',
        })

        try {
            if (user.image) await unlink(join(__dirname, '..', 'public', 'uploads', user.image), () => {}) // Delete profile picture
        } catch (e) {}

        try {
            const playlists = await Playlist.find({owner: user._id}) // Find user playlists
            for (const playlist of playlists) { // Loop through playlists
                if (playlist.image) await unlink(join(__dirname, '..', 'public', 'uploads', playlist.image), () => {}) // Delete playlist cover
                await playlist.deleteOne() // Delete playlist from database
            }
        } catch (e) {}

        index.user.remove(doc => doc.id === user._id.toString()) // Remove user from index
        await user.deleteOne() // Delete user from database

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'User deleted.',
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while deleting user.',
            error: e.message,
        })
    }
}

export const postAcceptUser = async (req, res) => {
    try {
        const {id} = req.params // Get user ID from request params
        const {accepted} = req.body // Get accepted from request body

        if (!id?.trim()?.length) return res.status(400).json({ // If ID is empty, return 400 response
            status: 'ERROR',
            message: 'User ID is required.',
        })

        const user = await User.findById(id) // Find user by ID

        if (!user) return res.status(404).json({ // If user is not found, return 404 response
            status: 'ERROR',
            message: 'User not found.',
        })

        if (id === req.user._id.toString()) return res.status(400).json({ // If ID is empty, return 400 response
            status: 'ERROR',
            message: 'You cannot accept yourself.',
        })

        if (!user?.activated) user.activated = true // Set user activated
        user.accepted = !!accepted // Set user accepted
        await user.save() // Update user in database

        if (user.accepted) index.user.add({ // Add user to index
            id: user._id.toString(),
            name: user.name,
        })
        else index.user.remove(doc => doc.id === user._id.toString()) // Remove user from index

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'User accepted.',
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while accepting user.',
        })
    }
}

export const postCanRequest = async (req, res) => {
    try {
        const {canRequest} = req.body // Get can request from request body

        await App.updateOne({}, {
            $set: {usersCanRequest: canRequest}
        })

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Can request updated.',
        })
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error occurred while updating can request.',
            error: e.message,
        })
    }
}

export const deleteRequest = async (req, res) => {
    try {
        const {id} = req.params // Get request ID from request params

        if (!id?.trim()?.length) return res.status(400).json({ // If ID is empty, return 400 response
            status: 'ERROR',
            message: 'Request ID is required.',
        })

        const request = await Request.findById(id) // Find request by ID

        if (!request) return res.status(404).json({ // If request is not found, return 404 response
            status: 'ERROR',
            message: 'Request not found.',
        })

        await request.deleteOne() // Delete request from database

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Request deleted.',
        })
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error occurred while deleting request.',
            error: e.message,
        })
    }
}