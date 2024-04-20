import fs from 'fs'
import Playlist from '../models/playlist.js'
import User from '../models/user.js'
import Track from '../models/track.js'
import {join} from 'path'
import {__dirname} from '../utils/dirname.js'

export const getPlaylist = async (req, res) => {
    try {
        const {id} = req.params // Get playlist ID from request params
        const {tracks, likes, user: userId, populate} = req.query // Get populate from request query

        if (!id) return res.status(400).json({ // If there is no playlist ID, return 400 response
            status: 'ERROR',
            message: 'Playlist ID is required.',
        })

        const playlist = await Playlist.findById(id).populate({ // Find playlist by ID and populate it
            path: 'owner',
            select: 'name image',
        }).populate(tracks ? { // If tracks is true, populate tracks
            path: 'tracks',
            select: 'title audio duration explicit',
            populate: {
                path: 'album',
                select: 'title cover',
                populate: {
                    path: 'artist',
                    select: 'name image',
                },
            },
        } : likes ? { // If likes is true, populate tracks and owner
            path: 'tracks',
            select: 'id',
        } : '')

        if (!playlist) return res.status(404).json({ // If there is no playlist, return 404 response
            status: 'ERROR',
            message: 'Playlist not found.',
        })

        if (!playlist.image && playlist.tracks.length) {// If there is no playlist image
            if (!playlist.covers) playlist.covers = [] // If playlist covers is not defined, set it to empty array
            playlist.tracks.map(track => { // Map tracks
                if (track.album?.cover && !playlist.covers?.includes(track.album?.cover) && playlist.covers?.length < 4) // If track has an album cover and playlist covers does not include the album cover, push album cover to playlist covers
                    playlist.covers.push(track.album?.cover)
            })
        }

        let likedTracks = []
        let likedUsers = 0
        let liked = false

        if (likes) { // If likes is true
            likedUsers = await User.countDocuments({ // Count users that liked the playlist
                likedPlaylists: playlist._id,
            })

            if (userId) { // If user ID is defined
                const user = await User.findById(userId) // Find user from the user ID

                if (user) { // If user is exist
                    if (user.likedPlaylists?.find(a => a?.toString() === playlist?._id?.toString())) liked = true // If user liked the album, set liked to true
                    playlist.tracks.forEach(track => { // Map tracks
                        if (user.likedTracks?.find(t => t?.toString() === track?._id?.toString()) && !likedTracks.includes(track?._id?.toString()))
                            likedTracks.push(track?._id?.toString()) // If user liked the track, push track ID to likedTracks array
                    })
                }
            }
        }

        return res.status(200).json({ // Return 200 response with playlist data
            status: 'OK',
            message: 'Playlist retrieved successfully.',
            playlist: {
                ...(playlist?._doc || {}),
                ...(likes ? {
                    likes: likedTracks,
                    liked,
                    likedUsers,
                } : {}),
            }
        })
    } catch (e) { // If there is an error, return 500 response
        res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while retrieving playlist info.',
            error: e.message,
        })
    }
}

export const postPlay = async (req, res) => {
    try {
        const {user} = req // Get user from request

        if (!user) return res.status(401).json({ // If there is no user, return 401 response
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        const {id} = req.params // Get playlist ID from request params

        if (!id) return res.status(400).json({ // If there is no playlist ID, return 400 response
            status: 'ERROR',
            message: 'Playlist ID is required.',
        })

        const playlist = await Playlist.findById(id) // Find playlist by ID

        if (!playlist) return res.status(404).json({ // If there is no playlist, return 404 response
            status: 'ERROR',
            message: 'Playlist not found.',
        })

        if (!user?.lastListenedPlaylists) user.lastListenedPlaylists = [] // If user's last listened playlists is not defined, set it to empty array
        user.lastListenedPlaylists = user.lastListenedPlaylists.filter(p => p?.toString() !== playlist?._id?.toString()) // Remove playlist from user's last listened playlists
        user.lastListenedPlaylists.unshift(playlist._id) // Add playlist to user's last listened playlists

        if (user.lastListenedPlaylists.length > 20) user.lastListenedPlaylists = user.lastListenedPlaylists.slice(0, 20) // If user's last listened playlists length is greater than 10, remove the last item from the array

        await user.save() // Save user

        return res.status(200).json({ // Return 200 response with playlist data
            status: 'OK',
            message: 'Playlist added to user\'s last listened playlists.',
        })
    } catch (e) { // If there is an error, return 500 response
        res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while updating playlist.',
            error: e.message,
        })
    }
}

export const postCreate = async (req, res) => {
    try {
        const user = await User.findById(req.user._id) // Find user by ID

        if (!user) return res.status(404).json({ // If user is not exist, return 404 response
            status: 'ERROR',
            message: 'User not found',
        })

        const playlists = await Playlist.find({ // Find playlists by owner ID
            owner: user._id,
        })

        const playlist = await Playlist.create({ // Create playlist
            title: `My playlist #${(playlists?.length || 0) + 1}`,
            owner: user._id,
        })

        res.status(201).json({ // Return 201 response when playlist is successfully created
            status: 'OK',
            message: 'Playlist created successfully',
            id: playlist._id,
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while creating the playlist',
            error: e.message,
        })
    }
}

export const postUpdate = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        const {id} = req.params // Get playlist ID from request params

        if (!id) return res.status(400).json({ // If there is no playlist ID, return an error
            status: 'ERROR',
            message: 'Playlist ID is required.',
        })

        const image = req.file // Get image from the request files
        const {title, noImage} = req.body // Get title and noImage from the request body

        if (!title || !title?.trim()?.length) return res.status(400).json({ // If there is no title, return an error
            status: 'ERROR',
            message: 'Title is required.',
        })

        const {user} = req // Get user from the request user

        if (!user) return res.status(404).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'User not found.',
        })

        const playlist = await Playlist.findById(id).populate({
            path: 'tracks',
            select: 'album',
            populate: {
                path: 'album',
                select: 'cover',
            }
        }) // Find playlist by ID

        if (!playlist) return res.status(404).json({ // If there is no playlist, return an error
            status: 'ERROR',
            message: 'Playlist not found.',
        })

        if (playlist.owner.toString() !== user._id.toString() && !user?.admin) return res.status(401).json({ // If playlist owner is not the user, return an error
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        let newImage = playlist.image

        if (image || noImage === 'true') { // If image is defined or noImage is true
            const currentImagePath = join(__dirname, '..', 'public', 'uploads', playlist.image || '_') // Create current image path
            if (user.image && fs.existsSync(currentImagePath)) fs.unlinkSync(currentImagePath) // If the playlist has an image and the current image path is exists, delete the image file
        }

        if (image) newImage = image.filename // If image is defined, set new image to the file name of the image
        if (noImage) newImage = null // If noImage is true, set new image to null

        // Update playlist with new data
        playlist.title = title?.trim()?.slice(0, 50)
        playlist.image = newImage

        await playlist.save() // Save playlist

        if (!playlist.image && playlist.tracks.length) {// If there is no playlist image
            if (!playlist.covers) playlist.covers = [] // If playlist covers is not defined, set it to empty array
            playlist.tracks.map(track => { // Map tracks
                if (track.album?.cover && !playlist.covers?.includes(track.album?.cover) && playlist.covers?.length < 4) // If track has an album cover and playlist covers does not include the album cover, push album cover to playlist covers
                    playlist.covers.push(track.album?.cover)
            })
        }

        return res.status(200).json({ // Return success response
            status: 'OK',
            message: 'Playlist updated.',
            title: title?.trim(),
            image: newImage,
            covers: playlist.covers,
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while updating the playlist.',
            error: e.message,
        })
    }
}

export const getUserPlaylists = async (req, res) => {
    try {
        const {id} = req.params // Get user ID from request params

        if (!id) return res.status(400).json({ // If there is no user ID, return 400 response
            status: 'ERROR',
            message: 'User ID is required.',
        })

        const playlists = await Playlist.find({ // Find playlists by ID
            owner: id,
        }, {
            title: 1,
            image: 1,
            covers: 1,
            owner: 1,
            tracks: 1,
        }).populate({ // Populate owner
            path: 'owner',
            select: 'name',
        }).populate({ // Populate tracks
            path: 'tracks',
            select: 'audio album',
            populate: {
                path: 'album',
                select: 'title cover',
            },
        })

        if (playlists?.length) {
            playlists.map(playlist => { // Map playlists
                const covers = []
                if (!playlist.image) // If there is no playlist image
                    playlist.tracks.forEach(track => { // Map tracks
                        if (track?.album?.cover && !covers.includes(track.album.cover) && covers.length < 4) covers.push(track.album.cover) // If track has album cover and covers array does not include it, push album cover to covers array
                    })
                playlist.covers = covers // Set covers array to playlist
            })
        }

        return res.status(200).json({ // Return 200 response with users data
            status: 'OK',
            message: 'Playlists retrieved successfully.',
            playlists,
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while retrieving user\'s playlists.',
            error: e.message,
        })
    }
}

export const getLikedPlaylists = async (req, res) => {
    try {
        const {id} = req.params // Get user ID from request params

        if (!id) return res.status(400).json({ // If there is no user ID, return 400 response
            status: 'ERROR',
            message: 'User ID is required.',
        })

        const user = await User.findById(id) // Find user by ID

        if (!user) return res.status(404).json({ // If there is no user, return 404 response
            status: 'ERROR',
            message: 'User not found.',
        })

        const playlists = await Playlist.find({ // Find playlists by ID
            _id: {
                $in: user.likedPlaylists,
            },
        }, {
            title: 1,
            image: 1,
            covers: 1,
            owner: 1,
        }).populate({ // Populate owner
            path: 'owner',
            select: 'name',
        }).populate({ // Populate tracks
            path: 'tracks',
            select: 'audio album',
            populate: {
                path: 'album',
                select: 'title cover',
            },
        })

        if (playlists?.length) {
            playlists.map(playlist => { // Map playlists
                const covers = []
                if (!playlist.image) // If there is no playlist image
                    playlist.tracks.forEach(track => { // Map tracks
                        if (track?.album?.cover && !covers.includes(track.album.cover) && covers.length < 4) covers.push(track.album.cover) // If track has album cover and covers array does not include it, push album cover to covers array
                    })
                playlist.covers = covers // Set covers array to playlist
            })
        }

        return res.status(200).json({ // Return 200 response with users data
            status: 'OK',
            message: 'Playlists retrieved successfully.',
            playlists,
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while retrieving liked playlists.',
            error: e.message,
        })
    }
}

export const deletePlaylist = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        const {id} = req.params // Get playlist ID from request params

        if (!id) return res.status(400).json({ // If there is no playlist ID, return an error
            status: 'ERROR',
            message: 'Playlist ID is required.',
        })

        const {user} = req // Get user from the request user

        if (!user) return res.status(404).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'User not found.',
        })

        const playlist = await Playlist.findById(id) // Find playlist by ID

        if (!playlist) return res.status(404).json({ // If there is no playlist, return an error
            status: 'ERROR',
            message: 'Playlist not found.',
        })

        if (playlist.owner.toString() !== user._id.toString() && !user?.admin) return res.status(401).json({ // If playlist owner is not the user, return an error
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        const currentImagePath = join(__dirname, '..', 'public', 'uploads', playlist.image || '_') // Create current image path
        if (playlist.image && fs.existsSync(currentImagePath)) fs.unlinkSync(currentImagePath) // If the playlist has an image and the current image path is exists, delete the image file

        await playlist.deleteOne() // Delete playlist

        return res.status(200).json({ // Return success response
            status: 'OK',
            message: 'Playlist deleted.',
        })
    } catch (e) {
        return res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while deleting the playlist.',
            error: e.message,
        })
    }
}

export const postAddTracks = async (req, res) => {
    try {
        const {id} = req.params // Get playlist ID from request params
        const {tracks} = req.body // Get tracks from request body

        if (!id) return res.status(400).json({ // If there is no playlist ID, return 400 response
            status: 'ERROR',
            message: 'Playlist ID is required.',
        })

        if (!tracks) return res.status(400).json({ // If there is no tracks, return 400 response
            status: 'ERROR',
            message: 'Tracks are required.',
        })

        const playlist = await Playlist.findById(id) // Find playlist by ID

        if (!playlist) return res.status(404).json({ // If there is no playlist, return 404 response
            status: 'ERROR',
            message: 'Playlist not found.',
        })

        const tracksExist = await Track.find({ // Find tracks by ID
            _id: { // Where ID is in tracks and not in playlist.tracks
                $in: tracks,
                $nin: playlist.tracks,
            },
        }, 'title audio duration album').populate({
            path: 'album',
            select: 'title cover artist',
            populate: {
                path: 'artist',
                select: 'name image',
            }
        })

        if (!tracksExist) return res.status(404).json({ // If there is no tracks, return 404 response
            status: 'ERROR',
            message: 'Tracks not found.',
        })

        const tracksToAdd = tracksExist.map(track => track._id) // Get tracks ID
        playlist.tracks = [...playlist.tracks, ...tracksToAdd] // Add tracks to playlist
        await playlist.save() // Save playlist

        return res.status(200).json({ // Return 200 response with playlist data
            status: 'OK',
            message: 'Tracks added successfully.',
            tracks: tracksExist,
        })
    } catch (e) { // If there is an error, return 500 response
        res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while adding tracks to playlist.',
            error: e.message,
        })
    }
}

export const postRemoveTracks = async (req, res) => {
    try {
        const {id} = req.params // Get playlist ID from request params
        const {tracks} = req.body // Get tracks from request body

        if (!id) return res.status(400).json({ // If there is no playlist ID, return 400 response
            status: 'ERROR',
            message: 'Playlist ID is required.',
        })

        if (!tracks) return res.status(400).json({ // If there is no tracks, return 400 response
            status: 'ERROR',
            message: 'Tracks are required.',
        })

        const playlist = await Playlist.findById(id) // Find playlist by ID

        if (!playlist) return res.status(404).json({ // If there is no playlist, return 404 response
            status: 'ERROR',
            message: 'Playlist not found.',
        })

        playlist.tracks = playlist.tracks.filter(track => !tracks.includes(track.toString())) // Remove tracks from playlist
        await playlist.save() // Save playlist

        return res.status(200).json({ // Return 200 response with playlist data
            status: 'OK',
            message: 'Tracks removed successfully.',
        })
    } catch (e) { // If there is an error, return 500 response
        res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while removing tracks from playlist.',
            error: e.message,
        })
    }
}

export const postReorder = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        const {id} = req.params // Get playlist ID from request params
        const {tracks} = req.body // Get tracks from request body

        if (!id) return res.status(400).json({ // If there is no playlist ID, return 400 response
            status: 'ERROR',
            message: 'Playlist ID is required.',
        })

        if (!tracks) return res.status(400).json({ // If there is no tracks, return 400 response
            status: 'ERROR',
            message: 'Tracks are required.',
        })

        const playlist = await Playlist.findById(id) // Find playlist by ID

        if (!playlist) return res.status(404).json({ // If there is no playlist, return 404 response
            status: 'ERROR',
            message: 'Playlist not found.',
        })

        if (playlist.owner.toString() !== req.user._id.toString() && !req.user?.admin) return res.status(401).json({ // If playlist owner is not the user, return an error
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        playlist.tracks = tracks // Set playlist tracks to tracks
        await playlist.save() // Save playlist

        return res.status(200).json({ // Return 200 response with playlist data
            status: 'OK',
            message: 'Playlist reordered successfully.',
        })
    } catch (e) { // If there is an error, return 500 response
        res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while reordering playlist tracks.',
            error: e.message,
        })
    }
}

export const getIsLiked = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ // If user is not logged in, return 401 response
            status: 'ERROR',
            message: 'Unauthorized',
        })

        const {id} = req.params // Get playlist ID from request parameters
        const playlist = await Playlist.findById(id) // Find playlist by ID

        if (!playlist) return res.status(404).json({ // If playlist is not exists, return 404 response
            status: 'ERROR',
            message: 'Playlist is not exists',
        })

        const {user} = req // Get user from request

        if (!user) return res.status(404).json({ // If user is not exists, return 404 response
            status: 'ERROR',
            message: 'User is not exists',
        })

        const isLiked = user.likedPlaylists?.find(t => t.toString() === playlist._id.toString()) // Check is playlist liked by user

        return res.status(200).json({ // Send OK response to the client
            status: 'OK',
            message: 'Is playlist liked',
            isLiked: !!isLiked,
        })
    } catch (e) {
        return res.status(500).json({ // Send error response to the client
            status: 'ERROR',
            message: e.message,
        })
    }
}

export const postLike = async (req, res) => {try {
    if (!req.user) return res.status(401).json({ // If user is not logged in, return 401 response
        status: 'ERROR',
        message: 'Unauthorized',
    })

    const {id} = req.params // Get playlist ID from request parameters
    const {like} = req.body // Get user ID from request body
    const playlist = await Playlist.findById(id) // Find playlist by ID

    if (!playlist) return res.status(404).json({ // If playlist is not exists, return 404 response
        status: 'ERROR',
        message: 'Playlist is not exists',
    })

    const {user} = req // Get user from request

    if (!user) return res.status(404).json({ // If user is not exists, return 404 response
        status: 'ERROR',
        message: 'User is not exists',
    })

    if (!user?.likedPlaylists) user.likedPlaylists = [] // If user's liked playlists is not exists, create empty array
    user.likedPlaylists = user.likedPlaylists.filter((t, i) => user.likedPlaylists.findIndex(t2 => t2.toString() === t.toString()) === i) // Remove duplicate playlists from user's liked albums


    if (Number(like) === 1 && !user.likedPlaylists?.find(t => t.toString() === playlist._id.toString())) user.likedPlaylists.push(playlist._id.toString()) // If playlist is not liked by user, push playlist to user's liked playlists
    else if (Number(like) === -1 && user.likedPlaylists?.find(t => t.toString() === playlist._id.toString())) user.likedPlaylists = user.likedPlaylists.filter(t => t.toString() !== playlist._id.toString()) // If playlist is liked by user, remove playlist from user's liked playlists

    await user.save() // Save user

    const totalLikes = await User.countDocuments({ // Count users that liked the playlist
        likedPlaylists: playlist._id,
    })

    return res.status(200).json({ // Send OK response to the client
        status: 'OK',
        message: Number(like) === 1 ? 'Playlist is successfully liked' : 'Playlist is successfully unliked',
        liked: !!user.likedPlaylists?.find(t => t.toString() === playlist._id.toString()),
        likes: totalLikes || 0,
    })
} catch (e) {
    return res.status(500).json({ // Send error response to the client
        status: 'ERROR',
        message: e.message,
    })
}
}