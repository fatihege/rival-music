import {Schema, model} from 'mongoose'

const UserSchema = new Schema({
    image: String,
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileColor: {
        type: Array,
        default: [255, 255, 255],
    },
    accentColor: {
        type: Array,
        default: [28, 28, 28],
    },
    followedArtists: [{
        type: Schema.Types.ObjectId,
        ref: 'Artist',
    }],
    followedUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    likedTracks: [{
        type: Schema.Types.ObjectId,
        ref: 'Track',
    }],
    likedAlbums: [{
        type: Schema.Types.ObjectId,
        ref: 'Album',
    }],
    likedPlaylists: [{
        type: Schema.Types.ObjectId,
        ref: 'Playlist',
    }],
    lastListenedTracks: [{
        type: Schema.Types.ObjectId,
        ref: 'Track',
    }],
    lastListenedAlbums: [{
        type: Schema.Types.ObjectId,
        ref: 'Album',
    }],
    lastListenedPlaylists: [{
        type: Schema.Types.ObjectId,
        ref: 'Playlist',
    }],
    lastListenedArtists: [{
        type: Schema.Types.ObjectId,
        ref: 'Artist',
    }],
    activated: {
        type: Boolean,
        default: false,
    },
    accepted: {
        type: Boolean,
        default: false,
    },
    admin: {
        type: Boolean,
        default: false,
    },
    activationToken: String,
    resetPasswordToken: String,
}, {
    timestamps: true,
})

export default model('User', UserSchema)