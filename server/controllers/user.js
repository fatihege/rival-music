import jwt from 'jsonwebtoken'
import fs from 'fs'
import {join} from 'path'
import checkEmail from '../utils/check-email.js'
import {encrypt} from '../utils/encryption.js'
import User from '../models/user.js'
import authenticate from '../utils/authenticate.js'
import {__dirname} from '../utils/dirname.js'
import {checkPassword, checkUserName} from '../utils/checkers.js'

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

const getFollowers = async (userId, count = true) => {
    const query = {followedUsers: {$in: [userId]}} // Prepare query for followers of the user
    const projection = {name: 1, profileColor: 1, accentColor: 1, image: 1} // Get only name, profile color, accent color and image attributes
    return count ? await User.countDocuments(query) : await User.find(query, projection) // If count is true, return the count of the followers. Otherwise, return the followers
}

export const getUser = async (req, res) => {
    try {
        const {token} = req.params // Get token from request parameters
        const {id, props} = req.query // Get user ID and requested props from query string

        if (!token && !id) return res.status(400).json({ // If token is not specified, return 400 response
            status: 'ERROR',
            message: 'Token or ID is required.',
        })

        let userId = null

        if (token) {
            const decodedToken = jwt.verify(token, process.env.JWT_KEY) // Decode JWT token

            if (!decodedToken.userId) return res.status(404).json({ // If decoded JWT token is not valid, return 404 response
                status: 'ERROR',
                message: 'Token expired.',
            })

            userId = decodedToken.userId
        } else userId = id

        const user = await User.findById(userId, {password: 0}).populate('followedUsers', 'name profileColor accentColor') // Find user from the user id of the decoded token

        if (!user || !user._id) return res.status(404).json({ // If there is no user, return 404 response
            status: 'ERROR',
            message: 'User not found.',
        })

        let result = {}

        if (props && props.split(',').length) { // If properties are not empty
            for (let prop of props.split(',')) { // Split and loop all properties
                const propName = prop.trim().startsWith('count:') ? prop.trim().slice('count:'.length).trim() : prop.trim() // Get property name
                if (propName === 'followers') { // If property name is 'followers'
                    result[propName] = await getFollowers(user._id, prop.trim().startsWith('count:')) // Get followers
                } else if (typeof user[propName] !== 'undefined' && !prop.includes('password')) // Else, if user has the property and the name of the property is not 'password'
                    result[propName] = prop.startsWith('count:') ? user[propName]?.length : user[propName] // Update result by property
            }
        } else result = {
            id: user._id,
            email: user.email,
            name: user.name,
            image: user.image,
            accepted: user.accepted,
            admin: user.admin,
            createdAt: user.createdAt,
        }

        res.status(200).json({ // If there is a user, return user info
            status: 'OK',
            user: result,
        })
    } catch (e) {
        res.status(e.message === 'jwt expired' ? 404 : 500).json({ // Return 404 response if JWT token is expired, return 500 response if there is another problem
            status: 'ERROR',
            message: e?.message?.includes('jwt') ? 'JWT Token expired' : 'An error occurred while retrieving user info.',
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

        if (!name?.trim().length) errors.push({ // If the name is not specified, insert an error
            field: 'name',
            message: 'Please enter a name.',
        })
        else if (!checkUserName(name)) errors.push({ // If the length of the name is less than specified length, insert an error
            field: 'name',
            message: 'The name you entered is too short.',
        })

        if (!password?.length) errors.push({ // If the password is not specified, insert an error
            field: 'password',
            message: 'Please enter a password.',
        })
        else if (!checkPassword(password)) errors.push({ // If the length of the password is less than 4, insert an error
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

export const postUpdateProfile = async (req, res) => {
    try {
        const {id} = req.params // Get user ID from the request parameters
        const image = req.file // Get image from the request files
        const {name, noImage, profileColor, accentColor} = req.body // Get data from the request body

        if (!id) return res.status(400).json({ // If there is no ID, return an error
            status: 'ERROR',
            message: 'Bad request.',
        })

        const user = await User.findById(id) // Get user by ID

        if (!user) return res.status(404).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'User not found.',
        })

        let newName = user.name
        let newImage = user.image
        let newProfileColor = user.profileColor
        let newAccentColor = user.accentColor

        const currentImagePath = join(__dirname, '..', 'images', user.image || '_') // Create current image path
        if (user.image && fs.existsSync(currentImagePath)) fs.unlinkSync(currentImagePath) // If the user has an image and the current image path is exists, delete the image file

        if (checkUserName(name)) newName = name // If the name is defined and the length of the name is greater than 4, set new name
        if (image) newImage = image.filename // If image is defined, set new image to the file name of the image
        if (noImage) newImage = null // If noImage is true, set new image to null

        if (profileColor && profileColor.split(',').length === 3 && profileColor?.match(/\d{1,3},\d{1,3},\d{1,3}/)) { // If profile color is defined and matches with the RGB pattern
            newProfileColor = profileColor.split(',') // Set new profile color

            for (let color of newProfileColor) // Loop all colors
                if (isNaN(Number(color)) || Number(color) < 0 || Number(color) > 255) { // If any of the colors is not a number or not in range of 0-255
                    newProfileColor = user.profileColor || [255, 255, 255] // Set new profile color to white
                    break // And then break
                }
        }

        if (accentColor && accentColor.split(',').length === 3 && accentColor?.match(/\d{1,3},\d{1,3},\d{1,3}/)) { // If accent color is defined and matches with the RGB pattern
            newAccentColor = accentColor.split(',') // Set new profile color

            for (let color of newAccentColor) // Loop all colors
                if (isNaN(Number(color)) || Number(color) < 0 || Number(color) > 255) { // If any of the colors is not a number or not in range of 0-255
                    newAccentColor = user.accentColor || [255, 255, 255] // Set new profile color to white
                    break // And then break
                }
        }

        // Update the user with the new data
        user.name = newName
        user.image = newImage
        user.profileColor = newProfileColor
        user.accentColor = newAccentColor

        await user.save() // Save user

        return res.status(200).json({ // Return success response
            status: 'OK',
            message: 'User profile updated.',
            image: newImage,
            name: newName,
            profileColor: newProfileColor,
            accentColor: newAccentColor,
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while updating user profile.',
            error: e.message,
        })
    }
}


export const postUpdateUser = async (req, res) => {
    try {
        const {id} = req.params // Get user ID from the request parameters
        const {name, email, currentPassword, newPassword, passwordConfirm} = req.body // Get data from the request body

        if (!id) return res.status(400).json({ // If there is no ID, return an error
            status: 'ERROR',
            message: 'Bad request.',
        })

        const user = await User.findById(id) // Get user by ID

        if (!user) return res.status(404).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'User not found.',
        })

        if (name && email) { // If name and email fields are defined
            const errors = [] // Initialize error list
            let newName = user.name
            let newEmail = user.email

            if (checkUserName(name)) newName = name // If the name is defined and the length of the name is greater than 4, set new name
            if (checkEmail(email)) newEmail = email // If the email is defined and matches with the email pattern, set new email

            if (!name?.trim().length) errors.push({ // If the name is not specified, insert an error
                field: 'name',
                message: 'Please enter a name.',
            })
            else if (!checkUserName(name)) errors.push({ // If the length of the name is less than specified length, insert an error
                field: 'name',
                message: 'The name you entered is too short.',
            })
            else newName = name

            if (!email?.trim().length) errors.push({ // If the email is not specified, insert an error
                field: 'email',
                message: 'Please enter an email.',
            })
            else if (!checkEmail(email)) errors.push({ // Or the email is not matches with the valid pattern, insert an error
                field: 'email',
                message: 'The email address you entered is invalid.',
            })
            else newEmail = email

            if (returnErrors(errors, res)) return // Check errors

            // Update the user with the new data
            user.name = newName
            user.email = newEmail

            await user.save() // Save user

            return res.status(200).json({ // Return success response
                status: 'OK',
                message: 'User profile updated.',
                name: newName,
                email: newEmail,
            })
        } else if (currentPassword && newPassword && passwordConfirm) { // Else, if password fields are defined
            const errors = [] // Initialize error list

            if (!currentPassword?.length) errors.push({ // If current password is not specified, insert an error
                field: 'currentPassword',
                message: 'Please enter your current password.',
            })

            if (!newPassword?.length) errors.push({ // If the new password is not specified, insert an error
                field: 'password',
                message: 'Please enter your new password.',
            })
            else if (!checkPassword(newPassword)) errors.push({ // If the length of the new password is less than 4, insert an error
                field: 'password',
                message: 'Your new password is too short.',
            })

            if (!passwordConfirm?.length) errors.push({ // If the password confirmation is not specified, insert an error
                field: 'passwordConfirm',
                message: 'Confirm your new password.',
            })
            else if (newPassword !== passwordConfirm) errors.push({ // Or the value of the new password and the password confirmation field is not equal, insert an error
                field: 'passwordConfirm',
                message: 'The passwords you entered do not match.',
            })

            if (returnErrors(errors, res)) return // Check errors

            if (encrypt(newPassword) === user.password) errors.push({ // If the new password is equal to the user's current password, insert an error
                field: 'password',
                message: 'Your new password must be different from your current password.'
            })

            const encryptedPassword = encrypt(currentPassword) // Encrypt current password

            if (user.password !== encryptedPassword) errors.push({ // If passwords does not match, insert an error
                field: 'currentPassword',
                message: 'The password you entered is incorrect.',
            })

            if (returnErrors(errors, res)) return // Check errors

            const newEncryptedPassword = encrypt(newPassword) // Encrypt new password
            if (newEncryptedPassword) { // If new password is encrypted
                user.password = newEncryptedPassword // Update user's password
                await user.save() // Save user
                return res.status(200).json({ // Return success response
                    status: 'OK',
                    message: 'Password updated successfully.',
                })
            } else throw new Error() // Otherwise, throw an empty error
        } else return res.status(400).json({ // Otherwise, return 400 response
            status: 'ERROR',
            message: 'Bad request.',
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while updating user.',
            error: e.message,
        })
    }
}