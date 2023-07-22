import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import {encrypt} from './encryption.js'

export default async (email, password, isPasswordEncrypted = false, userRecord = null) => {
    try {
        if (!email?.trim()?.length || !password?.length) return 1 // If there is no email or password, return code 1

        const user = (!userRecord || !userRecord._id) ? await User.findOne({email}) : userRecord // If userRecord is not specified, get user from database
        if (!user) return 2 // If there is no user, return code 2

        const encryptedPassword = !isPasswordEncrypted ? encrypt(password) : password // If the given password is not encrypted, encrypt the password
        if (encryptedPassword !== user.password) return 3 // If the passwords do not match, return code 3

        return { // Otherwise, return token and user info
            token: jwt.sign({userId: user._id}, process.env.JWT_KEY, {
                expiresIn: '1d',
            }),
            id: user._id,
            email: user.email,
            name: user.name,
            image: user.image,
            accepted: user.accepted,
            admin: user.admin,
            dateOfBirth: user.dateOfBirth,
            createdAt: user.createdAt,
            profileColor: user.profileColor,
            accentColor: user.accentColor,
        }
    } catch (e) {
        return e
    }
}