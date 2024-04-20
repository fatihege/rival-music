import {Schema, model} from 'mongoose'

const AppSchema = new Schema({
    exploreGenres: [{
        type: String,
    }],
    usersMustAccepted: {
        type: Boolean,
        default: true,
    },
    usersCanRequest: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    collection: 'app',
})

export default model('App', AppSchema)