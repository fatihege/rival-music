import {Schema, model} from 'mongoose'

const TrackSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    explicit: {
        type: Boolean,
        default: false,
    },
    audio: String,
    duration: {
        type: Number,
    },
    album: {
        type: Schema.Types.ObjectId,
        ref: 'Album',
        required: true,
    },
    artists: [{
        type: Schema.Types.ObjectId,
        ref: 'Artist',
    }],
    order: {
        type: Number,
        default: 0,
    },
    genres: [{
        type: String,
        required: true,
    }],
    lyrics: [Object],
}, {
    timestamps: true,
})

export default model('Track', TrackSchema)