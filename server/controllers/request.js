import App from '../models/app.js'
import User from '../models/user.js'
import Request from '../models/request.js'

export const getCanRequest = async (req, res) => {
    try {
        const app = await App.findOne()

        res.status(200).json({ // If success, return 200 response
            status: 'OK',
            message: 'Successfully checked if users can request',
            canRequest: app.usersCanRequest,
        })
    } catch (e) {
        res.status(500).json({ // If error occurred, return 500 response
            status: 'ERROR',
            message: 'Error occurred while checking if users can request',
            error: e.message,
        })
    }
}

export const getUserCanRequest = async (req, res) => {
    try {
        const user = await User.findById(req.params.id) // Find user by ID

        if (!user) // If user not found, return 404 response
            return res.status(404).json({
                status: 'ERROR',
                message: 'User not found',
            })

        if (user._id.toString() !== req.user._id.toString()) // If user ID does not match with user ID from token, return 403 response
            return res.status(403).json({
                status: 'ERROR',
                message: 'Forbidden',
            })

        const app = await App.findOne() // Find app
        const requests = await Request.find({user: user._id}) // Find requests by user

        res.status(200).json({ // If success, return 200 response
            status: 'OK',
            message: 'Successfully checked if user can request',
            canRequest: app.usersCanRequest,
            requests,
        })
    } catch (e) {
        res.status(500).json({ // If error occurred, return 500 response
            status: 'ERROR',
            message: 'Error occurred while checking if user can request',
            error: e.message,
        })
    }
}

export const getRequestsByUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id) // Find user by ID
        const {count} = req.query // Get count from query

        if (!user) { // If user not found, return 404 response
            return res.status(404).json({
                status: 'ERROR',
                message: 'User not found',
            })
        }

        if (count === '1') { // If count is 1, return count of requests by user
            const count = await Request.countDocuments({user: user._id})

            return res.status(200).json({ // If success, return 200 response
                status: 'OK',
                message: 'Successfully retrieved count of requests by user',
                count,
            })
        }

        const requests = await Request.find({user: user._id}) // Find requests by user

        res.status(200).json({ // If success, return 200 response
            status: 'OK',
            message: 'Successfully retrieved requests by user',
            requests,
        })
    } catch (e) {
        res.status(500).json({ // If error occurred, return 500 response
            status: 'ERROR',
            message: 'Error occurred while retrieving requests by user',
            error: e.message,
        })
    }
}

export const postRequest = async (req, res) => {
    try {
        const user = await User.findById(req.user._id) // Find user by ID

        if (!user) // If user not found, return 404 response
            return res.status(404).json({
                status: 'ERROR',
                message: 'User not found',
            })

        if (!req.body.content?.trim()?.length) // If content is empty, return 400 response
            return res.status(400).json({
                status: 'ERROR',
                message: 'Content is required',
            })

        const request = new Request({ // Create new request
            user: user._id,
            content: req.body.content?.trim()?.slice(0, 500), // Slice content to 500 characters
        })

        await request.save() // Save request

        res.status(200).json({ // If success, return 200 response
            status: 'OK',
            message: 'Successfully created request',
            request,
        })
    } catch (e) {
        res.status(500).json({ // If error occurred, return 500 response
            status: 'ERROR',
            message: 'Error occurred while creating request',
            error: e.message,
        })
    }
}