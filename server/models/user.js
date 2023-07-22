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
    dateOfBirth: Date,
    profileColor: {
        type: Array,
        default: [255, 255, 255],
    },
    accentColor: {
        type: Array,
        default: [28, 28, 28],
    },
    favouriteArtists: [{
        type: Schema.Types.ObjectId,
        ref: 'Artist',
    }],
    followedUsers: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    playlists: [{
        type: Schema.Types.ObjectId,
        ref: 'Playlist',
    }],
    accepted: {
        type: Boolean,
        default: false,
    },
    admin: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
})

export default model('User', UserSchema)
