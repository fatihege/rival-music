import {Schema, model} from 'mongoose'

const ArtistSchema = new Schema({
    image: String,
    name: {
        type: String,
        required: true
    },
    genres: [{
        type: String,
        required: true
    }],
    albums: [{
        type: Schema.Types.ObjectId,
        ref: 'Album',
    }],
}, {
    timestamps: true,
})

export default model('Artist', ArtistSchema)