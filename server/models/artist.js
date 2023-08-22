import {Schema, model} from 'mongoose'

const ArtistSchema = new Schema({
    image: String,
    banner: String,
    name: {
        type: String,
        required: true,
    },
    description: String,
    genres: [{
        type: String,
        required: true,
    }],
}, {
    timestamps: true,
})

export default model('Artist', ArtistSchema)