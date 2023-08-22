import {Schema, model} from 'mongoose'

const AlbumSchema = new Schema({
    cover: String,
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
        required: true,
    },
    releaseYear: {
        type: Number,
        required: true,
    },
    tracks: [{
        type: Schema.Types.ObjectId,
        ref: 'Track',
    }],
    genres: [{
        type: String,
        required: true,
    }],
}, {
    timestamps: true,
})

export default model('Album', AlbumSchema)