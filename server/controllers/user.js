import jwt from 'jsonwebtoken'
import checkEmail from '../utils/check-email.js'
import {encrypt} from '../utils/encryption.js'
import User from '../models/user.js'
import authenticate from '../utils/authenticate.js'

const returnErrors = (errors, res) => {
    if (errors.length) { // If errors is not empty
        res.status(400).json({ // Return an HTTP response
            status: 'ERROR',
            errors,
        })
        return true // And return true
    }

    return false // Otherwise, return false
}

export const getUser = async (req, res) => {
    try {
        const {token} = req.params // Get token from request parameters

        if (!token) return res.status(400).json({ // If token is not specified, return 400 response
            status: 'ERROR',
            message: 'Token is required.',
        })

        const decodedToken = jwt.verify(token, process.env.JWT_KEY) // Decode JWT token

        if (!decodedToken.userId) return res.status(404).json({ // If decoded JWT token is not valid, return 404 response
            status: 'ERROR',
            message: 'Token expired.',
        })

        const user = await User.findById(decodedToken.userId) // Find user from the user id of the decoded token

        if (!user || !user._id) return res.status(404).json({ // If there is no user, return 404 response
            status: 'ERROR',
            message: 'User not found.',
        })

        res.status(200).json({ // If there is a user, return user info
            status: 'OK',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                image: user.image,
                accepted: user.accepted,
                admin: user.admin,
                dateOfBirth: user.dateOfBirth,
                createdAt: user.createdAt,
            },
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while retrieving user info.',
            error: e.message,
        })
    }
}

export const postRegisterUser = async (req, res) => {
    try {
        const {name, email, password, passwordConfirm} = req.body // Get data from request body
        const errors = [] // Initialize error list

        if (!email?.trim().length) errors.push({ // If the email is not specified, insert an error
            field: 'email',
            message: 'Please enter an email.',
        })
        else if (!checkEmail(email)) errors.push({ // Or the email is not matches with the valid pattern, insert an error
            field: 'email',
            message: 'The email address you entered is invalid.',
        })

        if (!name?.trim().length) errors.push({ // If yhe name is not specified, insert an error
            field: 'name',
            message: 'Please enter a name.',
        })
        else if (name?.length < 4) errors.push({ // If the length of the name is less than 4, insert an error
            field: 'name',
            message: 'The name you entered is too short.',
        })

        if (!password?.length) errors.push({ // If the password is not specified, insert an error
            field: 'password',
            message: 'Please enter a password.',
        })
        else if (password?.length < 6) errors.push({ // If the length of the password is less than 4, insert an error
            field: 'password',
            message: 'Your password is too short.',
        })

        if (!passwordConfirm?.length) errors.push({ // If the password confirmation is not specified, insert an error
            field: 'passwordConfirm',
            message: 'Confirm your password.',
        })
        else if (password !== passwordConfirm) errors.push({ // Or the value of the password and the password confirmation field is not equal, insert an error
            field: 'passwordConfirm',
            message: 'The passwords you entered do not match.',
        })

        const foundUser = await User.findOne({email}) // Check if there is a user with the email address

        if (foundUser) errors.push({ // If there is a user with the email adress, insert an error
            field: 'email',
            message: 'There is a user belonging to this email address.',
        })

        if (returnErrors(errors, res)) return // Check errors

        const encryptedPassword = encrypt(password) // Encrypt password
        const count = await User.count({}) // Count number user records in the database
        const user = new User({name, email, password: encryptedPassword, admin: !count}) // Create a user and make it an admin if the first user

        await user.save() // Save user

        const auth = await authenticate(email, password) // Create JWT token and get user info

        res.status(201).json({ // And return 201 response
            status: 'OK',
            message: 'User created.',
            user: {...auth},
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while creating user.',
        })
    }
}

export const postLoginUser = async (req, res) => {
    try {
        const {email, password} = req.body // Get data from request body
        const errors = [] // Initialize error list

        if (!email?.trim().length) errors.push({ // If the email is not specified, insert an error
            field: 'email',
            message: 'Please enter an email.',
        })
        else if (!checkEmail(email)) errors.push({ // Or the email is not matches with the valid pattern, insert an error
            field: 'email',
            message: 'The email address you entered is invalid.',
        })

        if (!password?.length) errors.push({ // If the password is not specified, insert an error
            field: 'password',
            message: 'Please enter a password.',
        })

        if (returnErrors(errors, res)) return // Check errors

        const user = await User.findOne({email}) // Get user of sent email address
        let encryptedPassword // Initialize encrypted password

        if (!user) errors.push({ // If there is no user, insert an error
            field: 'email',
            message: 'No user found for this email.',
        })
        else { // Otherwise
            encryptedPassword = encrypt(password) // Encrypt password
            if (encryptedPassword !== user.password) errors.push({ // And the encrypted password and the password of the user is not equals, insert an error
                field: 'password',
                message: 'The password you entered is incorrect.',
            })
        }

        if (returnErrors(errors, res)) return // Check errors

        const auth = await authenticate(email, encryptedPassword || user.password, !!encryptedPassword, user) // Create JWT token and get user info

        res.status(200).json({ // Return user info
            status: 'OK',
            message: 'Authenticated.',
            user: {...auth},
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while authenticating user.',
        })
    }
}
