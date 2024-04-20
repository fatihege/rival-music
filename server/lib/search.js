import Fuse from 'fuse.js'
import Track from '../models/track.js'
import Album from '../models/album.js'
import Artist from '../models/artist.js'
import User from '../models/user.js'
import Playlist from '../models/playlist.js'

const trackIndex = new Fuse([], {
    keys: ['title', 'album', 'artist'],
    shouldSort: true,
    useExtendedSearch: true,
})

const albumIndex = new Fuse([], {
    keys: ['title', 'artist'],
    shouldSort: true,
    useExtendedSearch: true,
})

const artistIndex = new Fuse([], {
    keys: ['name'],
    shouldSort: true,
    useExtendedSearch: true,
})

const userIndex = new Fuse([], {
    keys: ['name'],
    shouldSort: true,
    useExtendedSearch: true,
})

const playlistIndex = new Fuse([], {
    keys: ['title', 'description'],
    shouldSort: true,
    useExtendedSearch: true,
})

const index = {
    track: trackIndex,
    album: albumIndex,
    artist: artistIndex,
    user: userIndex,
    playlist: playlistIndex,
    async init() {
        console.log('Initializing search index...')

        const tracks = await Track.find({}, 'title album').populate({
            path: 'album',
            select: 'title',
            populate: {
                path: 'artist',
                select: 'name',
            }
        })
        const albums = await Album.find({}, 'title artist').populate({
            path: 'artist',
            select: 'name',
        })
        const artists = await Artist.find({}, 'name')
        const users = await User.find({}, 'name')
        const playlists = await Playlist.find({}, 'title owner').populate({
            path: 'owner',
            select: 'name',
        })

        tracks.forEach(track => trackIndex.add({
            id: track._id.toString(),
            title: track.title,
            album: track.album.title,
            artist: track.album.artist.name,
        }))

        albums.forEach(album => albumIndex.add({
            id: album._id.toString(),
            title: album.title,
            artist: album.artist.name,
        }))

        artists.forEach(artist => artistIndex.add({
            id: artist._id.toString(),
            name: artist.name,
        }))

        users.forEach(user => userIndex.add({
            id: user._id.toString(),
            name: user.name,
        }))

        playlists.forEach(playlist => playlistIndex.add({
            id: playlist._id.toString(),
            title: playlist.title,
            description: playlist.description,
        }))

        console.log('Search index initialized.')
    },
    search(query, limit, type) {
        if (type === 'track') return trackIndex.search(query, {limit})
        else if (type === 'album') return albumIndex.search(query, {limit})
        else if (type === 'artist') return artistIndex.search(query, {limit})
        else if (type === 'user') return userIndex.search(query, {limit})
        else if (type === 'playlist') return playlistIndex.search(query, {limit})
        else return {
            track: trackIndex.search(query, {limit}),
            album: albumIndex.search(query, {limit}),
            artist: artistIndex.search(query, {limit}),
            user: userIndex.search(query, {limit}),
            playlist: playlistIndex.search(query, {limit}),
        }
    }
}

export default index