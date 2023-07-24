import {Schema, model} from 'mongoose'

const TrackSchema = new Schema({
    cover: String,
    title: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
    },
    artist: {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
        required: true,
    },
    album: {
        type: Schema.Types.ObjectId,
        ref: 'Album',
        required: true,
    },
    genres: [{
        type: String,
        required: true
    }],
}, {
    timestamps: true,
})

export default model('Track', TrackSchema)