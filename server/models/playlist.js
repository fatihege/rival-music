import {Schema, model} from 'mongoose'

const PlaylistSchema = new Schema({
    image: String,
    title: {
        type: String,
        required: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tracks: [{
        type: Schema.Types.ObjectId,
        ref: 'Track',
    }],
}, {
    timestamps: true,
})

export default model('Playlist', PlaylistSchema)