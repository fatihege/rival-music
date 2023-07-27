import jwt from 'jsonwebtoken'
import User from '../models/user.js'

export default async (req, res, next) => {
    try {
        const {token} = req.params // Get token from request params
        if (!token?.length) return res.status(404).send() // If token is not exist, return 404 response

        const decodedToken = jwt.verify(token, process.env.JWT_KEY) // Decode JWT token

        if (!decodedToken?.userId) return res.status(404).json({ // If decoded JWT token is not valid, return 404 response
            status: 'ERROR',
            message: 'Token expired.',
        })

        const user = await User.findById(decodedToken.userId) // Find user by ID

        if (!user?.admin) return res.status(403).json({ // If user is not an admin, return 403 response
            status: 'FORBIDDEN',
            message: 'This user is not an admin.'
        })

        // If user is an admin, add user to request object and continue
        req.user = user
        next()
    } catch (e) {
        return res.status(500).json({
            status: 'ERROR',
            message: 'Internal server error.',
            error: e.message,
        })
    }
}