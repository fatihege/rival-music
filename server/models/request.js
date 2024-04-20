import {Schema, model} from 'mongoose'

const RequestSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
})

export default model('Request', RequestSchema)