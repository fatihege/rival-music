import jwt from 'jsonwebtoken'
import User from '../models/user.js'

export default async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] // Get token from request headers

        if (!token?.length) return res.status(404).send() // If token is not exist, return 404 response

        const decodedToken = jwt.verify(token, process.env.JWT_KEY) // Decode JWT token

        if (!decodedToken?.userId) return res.status(404).json({ // If decoded JWT token is not valid, return 404 response
            status: 'ERROR',
            message: 'Token expired.',
        })

        const user = await User.findById(decodedToken.userId) // Find user by ID

        if (!user) return res.status(404).json({ // If user is not exist, return 404 response
            status: 'ERROR',
            message: 'User not found.',
        })

        req.user = user // Add user to request object and continue
        next()
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Internal server error.',
            error: e.message,
        })
    }
}