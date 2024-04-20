import App from '../models/app.js'
import Album from '../models/album.js'
import Track from '../models/track.js'
import Artist from '../models/artist.js'
import User from '../models/user.js'
import Playlist from '../models/playlist.js'
import index from '../lib/search.js'

export const getPopularTriple = async (req, res) => {
    try {
        const track = await Track.findOne({}, {title: 1, album: 1}).populate({ // Get most played track
            path: 'album',
            select: 'title cover artist',
            populate: {
                path: 'artist',
                select: 'name'
            }
        }).sort({plays: -1}).limit(1)

        const album = await User.aggregate([ // Get most liked album from all users liked albums
            {
                $match: {
                    likedAlbums: {
                        $exists: true, $ne: []
                    }
                }
            },
            {
                $unwind: '$likedAlbums'
            },
            {
                $group: {
                    _id: '$likedAlbums',
                    count: {$sum: 1}
                }
            },
            {
                $sort: {count: -1}
            },
            {
                $limit: 1
            },
            {
                $lookup: {
                    from: 'albums',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'album'
                }
            },
            {
                $unwind: '$album'
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'album.artist',
                    foreignField: '_id',
                    as: 'album.artist'
                }
            },
            {
                $project: {
                    album: {
                        _id: 1,
                        cover: 1,
                        title: 1,
                        artist: {
                            _id: 1,
                            name: 1
                        },
                    },
                    count: 1
                }
            },
        ])

        const artist = await User.aggregate([ // Get most followed artist from all users followed artists
            {
                $match: {
                    followedArtists: {
                        $exists: true, $ne: []
                    }
                }
            },
            {
                $unwind: '$followedArtists'
            },
            {
                $group: {
                    _id: '$followedArtists',
                    count: {$sum: 1}
                }
            },
            {
                $sort: {count: -1}
            },
            {
                $limit: 1
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'artist'
                }
            },
            {
                $unwind: '$artist'
            },
            {
                $project: {
                    artist: {
                        _id: 1,
                        name: 1,
                        image: 1
                    },
                    count: 1
                }
            },
        ])

        return res.status(200).json({ // If success, return 200 response
            status: 'OK',
            message: 'Popular triple retrieved successfully',
            data: {
                track,
                album: {
                    ...album[0]?.album || (await Album.findOne({}, {title: 1, cover: 1, artist: 1}).populate({
                        path: 'artist',
                        select: 'name'
                    }).sort({createdAt: -1}))?._doc,
                },
                artist: {
                    ...artist[0]?.artist || (await Artist.findOne({}, {name: 1, image: 1}).sort({createdAt: -1}))?._doc,
                },
            },
        })
    } catch (e) {
        res.status(500).json({ // If error occurred, return 500 response
            status: 'ERROR',
            message: 'An error occurred while getting popular triple',
            error: e.message,
        })
    }
}

export const getGenres = async (req, res) => {
    try {
        const app = await App.findOne({}, {exploreGenres: 1}) // Get genres from app document

        return res.status(200).json({ // If success, return 200 response
            status: 'OK',
            message: 'Genres retrieved successfully',
            genres: app.exploreGenres,
        })
    } catch (e) {
        res.status(500).json({ // If error occurred, return 500 response
            status: 'ERROR',
            message: 'An error occurred while getting genres',
            error: e.message,
        })
    }
}

export const getGenre = async (req, res) => {
    try {
        const {genre} = req.params // Get genre from request parameters

        if (!genre?.trim()?.length) return res.status(400).json({ // If genre is not defined, return 400 response
            status: 'ERROR',
            message: 'Genre is not defined',
        })

        const {user: userId} = req.query // Get user from request query
        const user = await User.findById(userId) // Get user from database

        // Get top albums from most played tracks from genre
        const topAlbums = await Album.aggregate([
            {
                $match: {
                    genres: genre
                },
            },
            {
                $lookup: {
                    from: 'tracks',
                    localField: '_id',
                    foreignField: 'album',
                    as: 'tracks'

                }
            },
            {
                $unwind: '$tracks'
            },
            {
                $group: {
                    _id: '$_id',
                    title: {$first: '$title'},
                    cover: {$first: '$cover'},
                    artist: {$first: '$artist'},
                    plays: {$sum: '$tracks.plays'}
                }
            },
            {
                $sort: {plays: -1}
            },
            {
                $limit: 25
            },
            {
                $lookup: {
                    from: 'artists',
                    localField: 'artist',
                    foreignField: '_id',
                    as: 'artist'
                }
            },
            {
                $unwind: '$artist'
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    cover: 1,
                    artist: {
                        _id: 1,
                        name: 1
                    }
                }
            },
        ])

        // Get top tracks from genre
        const topTracks = await Track.find({genres: genre}, {title: 1, audio: 1, duration: 1, album: 1, liked: 1}).populate({
            path: 'album',
            select: 'title cover artist',
            populate: {
                path: 'artist',
                select: 'name'
            }
        }).limit(25).sort({plays: -1})

        if (user && topTracks?.length && user?.likedTracks?.length) // If user is defined and top tracks is defined and user liked tracks is defined
            topTracks.forEach(track => { // For each top track
                track.liked = !!user.likedTracks.find(likedTrack => likedTrack.toString() === track._id.toString()) // Check if user liked this track
            })

        // Get top artists from genre
        const topArtists = await Artist.find({genres: genre}, {name: 1, image: 1}).limit(25)

        // Get new albums from genre
        const newAlbums = await Album.find({genres: genre}, {title: 1, cover: 1, artist: 1}).populate({
            path: 'artist',
            select: 'name'
        }).limit(25).sort({createdAt: -1})

        // Get new artists from genre
        const newArtists = await Artist.find({genres: genre}, {name: 1, image: 1}).limit(25).sort({debutYear: -1})

        return res.status(200).json({ // If success, return 200 response
            status: 'OK',
            message: 'Genre retrieved successfully',
            data: {
                topAlbums,
                topTracks,
                topArtists,
                newAlbums,
                newArtists,
            },
        })
    } catch (e) {
        res.status(500).json({ // If error occurred, return 500 response
            status: 'ERROR',
            message: 'An error occurred while getting genre',
            error: e.message,
        })
    }
}

export const getSearch = async (req, res) => {
    try {
        const {query} = req.params // Get query from request parameters

        if (!query?.trim()?.length) return res.status(400).json({ // If query is not defined, return 400 response
            status: 'ERROR',
            message: 'Query is not defined',
        })

        const {user: userId} = req.query // Get user from request query
        const user = await User.findById(userId) // Get user from database
        const indexResults = await index.search(query, 50) // Search query in index
        const results = { // Define results object
            track: indexResults.track.map(result => result.item.id),
            album: indexResults.album.map(result => result.item.id),
            artist: indexResults.artist.map(result => result.item.id),
            user: indexResults.user.map(result => result.item.id),
            playlist: indexResults.playlist.map(result => result.item.id),
        }

        const tracks = await Track.find({_id: {$in: results.track}}, {title: 1, audio: 1, duration: 1, album: 1, liked: 1}).populate({
            path: 'album',
            select: 'title cover artist',
            populate: {
                path: 'artist',
                select: 'name'
            }
        })
        const albums = await Album.find({_id: {$in: results.album}}, {title: 1, cover: 1, artist: 1}).populate({
            path: 'artist',
            select: 'name'
        })
        const artists = await Artist.find({_id: {$in: results.artist}}, {name: 1, image: 1})
        const users = await User.find({_id: {$in: results.user}}, {name: 1, image: 1})
        const playlists = await Playlist.find({_id: {$in: results.playlist}}, {title: 1, description: 1, owner: 1, tracks: 1}).populate({
            path: 'owner',
            select: 'name'
        }).populate({
            path: 'tracks',
            select: 'title album',
            populate: {
                path: 'album',
                select: 'cover',
            }
        })

        if (user && tracks?.length && user?.likedTracks?.length) // If user is defined and tracks is defined and user liked tracks is defined
            tracks.forEach(track => { // For each track
                track.liked = !!user.likedTracks.find(likedTrack => likedTrack.toString() === track._id.toString()) // Check if user liked this track
            })

        if (playlists?.length) // If playlists is defined, define playlist cover
            playlists.forEach(playlist => {
                const covers = []
                if (!playlist.image) // If there is no playlist image
                    playlist.tracks.forEach(track => { // Map tracks
                        if (track?.album?.cover && !covers.includes(track.album.cover) && covers.length < 4) covers.push(track.album.cover) // If track has album cover and covers array does not include it, push album cover to covers array
                    })
                playlist.covers = covers // Set covers array to playlist
            })

        return res.status(200).json({ // If success, return 200 response
            status: 'OK',
            message: 'Search results retrieved successfully',
            data: {
                tracks: tracks.sort((a, b) => results.track.indexOf(a._id.toString()) - results.track.indexOf(b._id.toString())),
                albums: albums.sort((a, b) => results.album.indexOf(a._id.toString()) - results.album.indexOf(b._id.toString())),
                artists: artists.sort((a, b) => results.artist.indexOf(a._id.toString()) - results.artist.indexOf(b._id.toString())),
                users: users.sort((a, b) => results.user.indexOf(a._id.toString()) - results.user.indexOf(b._id.toString())),
                playlists: playlists.sort((a, b) => results.playlist.indexOf(a._id.toString()) - results.playlist.indexOf(b._id.toString())).map(playlist => {
                    playlist.tracks = null // Set tracks to null
                    return playlist
                }),
            },
        })
    } catch (e) {
        res.status(500).json({ // If error occurred, return 500 response
            status: 'ERROR',
            message: 'An error occurred while searching',
            error: e.message,
        })
    }
}