import jwt from 'jsonwebtoken'
import fs from 'fs'
import {join} from 'path'
import checkEmail from '../utils/check-email.js'
import {encrypt} from '../utils/encryption.js'
import App from '../models/app.js'
import User from '../models/user.js'
import Track from '../models/track.js'
import Playlist from '../models/playlist.js'
import Artist from '../models/artist.js'
import authenticate from '../utils/authenticate.js'
import {__dirname} from '../utils/dirname.js'
import {checkPassword, checkUserName} from '../utils/checkers.js'
import sendMail from '../utils/send-mail.js'
import config from '../config.js'
import escapeRegexp from '../utils/escape-regexp.js'

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
        const app = await App.findOne() // Get app info
        const {token} = req.params // Get token from request parameters
        const {id, props, reqUser} = req.query // Get user ID and requested props from query string

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

        const user = await User.findById(userId, {password: 0}) // Find user from the user ID
            .populate(props && props?.includes('populate:likedTracks') ? { // If properties are not empty and includes 'populate:likedTracks'
                path: 'likedTracks', // Populate liked tracks
                populate: {
                    path: 'album',
                    select: 'title cover',
                    populate: {
                        path: 'artist',
                        select: 'name',
                    },
                },
            } : null)
            .populate(props && props?.includes('populate:followedArtists') ? { // If properties are not empty and includes 'populate:followedArtists'
                path: 'followedArtists', // Populate followed artists
                select: 'name image',
            } : null)
            .populate(props && props?.includes('populate:followedUsers') ? { // If properties are not empty and includes 'populate:followedUsers'
                path: 'followedUsers', // Populate followed users
                select: 'name image',
            } : null)

        if (!user || !user._id) return res.status(404).json({ // If there is no user, return 404 response
            status: 'ERROR',
            message: 'User not found.',
        })

        const requestedUser = reqUser ? await User.findById(reqUser, {admin: 1}) : null // Get requested user from the requested user ID

        if (!requestedUser?.admin && !user.admin && !user.accepted && app.usersMustAccepted) return res.status(404).json({ // If user is not accepted, return 404 response
            status: 'NOT_ACCEPTED',
            message: 'User not accepted.',
        })

        if (!requestedUser?.admin && !user.admin && !user.activated) return res.status(404).json({ // If user is not activated, return 404 response
            status: 'NOT_ACTIVATED',
            message: 'User not activated.',
        })

        let following = null // Initialize following state
        if (reqUser) { // If requested user is specified
            const requestUser = await User.findById(reqUser).select('followedUsers')
            if (requestUser) following = !!requestUser.followedUsers?.find(u => u?.toString() === user._id?.toString()) // If requested user is found, check if the requested user is following the user
        }

        let result = {following}

        if (props && props.split(',').length) { // If properties are not empty
            for (let prop of props.split(',')) { // Split and loop all properties
                const propName = prop.trim().startsWith('count:') ? prop.trim().slice('count:'.length).trim() : prop.trim().startsWith('populate:') ? prop.trim().slice('populate:'.length).trim() : prop.trim() // Get property name
                if (propName === 'followers') // If property name is 'followers'
                    result[propName] = prop.startsWith('populate:') ? await getFollowers(user._id, false) : await getFollowers(user._id) // Get followers
                else if (propName === 'followedUsers') // Else, if property name is 'followedUsers'
                    result[propName] = prop.startsWith('populate:') ? (user?.followedUsers || []) : (user?.followedUsers?.length || 0) // Get followed users
                else if (propName === 'followedArtists') // Else, if property name is 'followedArtists'
                    result[propName] = prop.startsWith('populate:') ? (user?.followedArtists || []) : (user?.followedArtists?.length || 0) // Get followed artists
                else if (propName === 'likedTracks')
                    result[propName] = prop.startsWith('populate:') ? (user?.likedTracks?.reverse() || []) : (user?.likedTracks?.reverse() || []) // Get liked tracks
                else if (typeof user[propName] !== 'undefined' && !prop.includes('password')) // Else, if user has the property and the name of the property is not 'password'
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
            following,
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

export const getUsers = async (req, res) => {
    try {
        const {cursor, limit, sorting, query} = req.query // Get cursor, limit and sorting from request query
        const escapedQuery = query?.trim()?.length ? escapeRegexp(query?.trim()) : '' // Escape query string
        const users = await User.find(
            escapedQuery ? // If there is a query, find users with query
                {
                    $or: [
                        {name: {$regex: escapedQuery, $options: 'i'}},
                        {email: {$regex: escapedQuery, $options: 'i'}},
                    ],
                    accepted: sorting === 'waiting' ? false : { $ne: null },
                    admin: sorting === 'waiting' ? false : { $ne: null },
                } : {
                    accepted: sorting === 'waiting' ? false : { $ne: null },
                    admin: sorting === 'waiting' ? false : { $ne: null },
                }, // Otherwise, find all users
        {name: 1, email: 1, image: 1, admin: 1, accepted: 1}).sort( // Find users and sort them
            sorting === 'last-created' ? {createdAt: -1} : // If sorting is last-created, sort by createdAt descending
                sorting === 'first-created' ? {createdAt: 1} : // If sorting is first-created, sort by createdAt ascending
                    null // Otherwise, do not sort
        ).skip(!isNaN(Number(cursor)) ? cursor : 0).limit(!isNaN(Number(limit)) ? limit : 0) // Skip cursor and limit results

        return res.status(200).json({ // Return 200 response
            status: 'OK',
            message: 'Users retrieved.',
            users,
        })
    } catch (e) {
        return res.status(500).json({ // If there is an error, return 500 response
            status: 'ERROR',
            message: 'Error occurred while retrieving users.',
            error: e.message,
        })
    }
}

export const getLastListened = async (req, res) => {
    try {
        const {type} = req.params // Get type from request parameters
        const {limit} = req.query // Get limit and includes from query string

        if (!req?.user) return res.status(401).json({ // If there is no user, return 401 response
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        const user = await User.findById(req.user.id).populate(type === 'playlist' ? { // Get user from the user ID
            path: 'lastListenedPlaylists', // Populate last listened playlists
            select: 'title image covers owner',
            populate: {
                path: 'tracks',
                populate: {
                    path: 'album',
                    select: 'title cover',
                    populate: {
                        path: 'artist',
                        select: 'name',
                    }
                }
            },
            perDocumentLimit: isNaN(Number(limit)) ? 10 : Number(limit),
        } : type === 'album' ? { // If type is 'album'
            path: 'lastListenedAlbums', // Populate last listened albums
            select: 'title cover artist',
            populate: {
                path: 'artist',
                select: 'name',
            },
            perDocumentLimit: isNaN(Number(limit)) ? 10 : Number(limit),
        } : type === 'track' ? { // If type is 'track'
            path: 'lastListenedTracks', // Populate last listened tracks
            select: 'title album audio duration liked',
            populate: {
                path: 'album',
                select: 'title cover',
                populate: {
                    path: 'artist',
                    select: 'name',
                }
            },
            perDocumentLimit: isNaN(Number(limit)) ? 10 : Number(limit),
        } : type === 'artist' ? { // If type is 'artist'
            path: 'lastListenedArtists', // Populate last listened artists
            select: 'name image',
        } : null).populate(type === 'playlist' ? { // If type is 'playlist'
            path: 'lastListenedPlaylists', // Populate last listened playlists
            select: 'title image covers owner',
            populate: {
                path: 'owner',
                select: 'name',
            }
        } : null)

        if (type === 'playlist' && user.lastListenedPlaylists?.length) { // If type is 'playlist' and there are last listened playlists
            user.lastListenedPlaylists.map(playlist => { // Map playlists
                const covers = []
                if (!playlist.image) // If there is no playlist image
                    playlist.tracks.forEach(track => { // Map tracks
                        if (track?.album?.cover && !covers.includes(track.album.cover) && covers.length < 4) covers.push(track.album.cover) // If track has album cover and covers array does not include it, push album cover to covers array
                    })
                playlist.covers = covers // Set covers array to playlist
            })
        } else if (type === 'track' && user.lastListenedTracks?.length) { // Else, if type is 'track' and there are last listened tracks
            user.lastListenedTracks.map(track => { // Map tracks
                track.liked = !!user.likedTracks?.find(t => t?.toString() === track._id?.toString()) // Check if the user liked the track
            })
        }

        res.status(200).json({ // Return last listened tracks
            status: 'OK',
            list: type === 'playlist' ? user.lastListenedPlaylists : type === 'album' ? user.lastListenedAlbums : type === 'track' ? user.lastListenedTracks : type === 'artist' ? user.lastListenedArtists : [],
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while retrieving last listened tracks.',
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

        const activationToken = jwt.sign({email}, process.env.JWT_KEY, {expiresIn: '1h'}) // Create JWT token for activation
        const encryptedPassword = encrypt(password) // Encrypt password
        const count = await User.count({}) // Count number user records in the database
        const user = new User({ // Create a user and make it an admin if the first user
            name,
            email,
            password: encryptedPassword,
            admin: !count,
            activationToken: count ? activationToken : null,
        })

        await user.save() // Save user

        const auth = count ? null : await authenticate(email, password) // Create JWT token and get user info

        if (count) sendMail({
            email,
            ...config.activationMail(activationToken)
        })

        res.status(201).json({ // And return 201 response
            status: 'OK',
            message: 'User created.',
            user: !count && auth ? {...auth} : null,
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
        const app = await App.findOne() // Get app info
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

        if (!user.admin && !user.accepted && app.usersMustAccepted) return res.status(404).json({ // If user is not activated, return 404 response
            status: 'NOT_ACCEPTED',
            message: 'User not accepted.',
        })

        if (!user.admin && !user.activated) return res.status(404).json({ // If user is not activated, return 404 response
            status: 'NOT_ACTIVATED',
            message: 'User not activated.',
        })

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

export const postActivateUser = async (req, res) => {
    try {
        const {token} = req.body // Get token from request body

        if (!token) return res.status(400).json({ // If token is not specified, return 400 response
            status: 'ERROR',
            message: 'Token is required.',
        })

        jwt.verify(token, process.env.JWT_KEY, {}, async (err, decoded) => { // Decode JWT token
            if (err) {
                const user = await User.findOne({activationToken: token}) // Get user of sent activation token

                if (!user) return res.status(404).json({ // If there is no user, return 404 response
                    status: 'USER_NOT_FOUND',
                    message: 'User not found.',
                })

                const activationToken = jwt.sign({email: user.email}, process.env.JWT_KEY, {expiresIn: '1h'})
                user.activationToken = activationToken // Update user's activation token
                await user.save() // Save user

                sendMail({ // Send activation mail
                    email: user.email,
                    ...config.activationMail(activationToken)
                }, (err) => {
                    if (err) return res.status(500).json({ // If there is an error, return 500 response
                        status: 'ERROR',
                        message: 'An error occurred while sending activation mail.',
                        error: err,
                    })
                    else return res.status(404).json({ // Otherwise, return 404 response
                        status: 'TOKEN_EXPIRED',
                        message: 'Token expired.',
                        newToken: true,
                    })
                })
            } else {
                const {email} = decoded // Get email from decoded JWT token

                if (!email) return res.status(404).json({ // If there is no email, return 404 response
                    status: 'USER_NOT_FOUND',
                    message: 'User not found.',
                })

                const user = await User.findOne({email}) // Get user of sent email address

                if (!user) return res.status(404).json({ // If there is no user, return 404 response
                    status: 'USER_NOT_FOUND',
                    message: 'User not found.',
                })

                user.activationToken = null // Set user's activation token to null
                user.activated = true // Set user's activated state to true
                await user.save() // Save user
                const auth = await authenticate(user.email, user.password, true, user) // Create JWT token and get user info

                res.status(201).json({ // And return 201 response
                    status: 'OK',
                    message: 'User activated.',
                    token: auth?.token,
                })
            }
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while activating user.',
            error: e.message,
        })
    }
}

export const postForgotPassword = async (req, res) => {
    try {
        const {email} = req.body // Get email from request body
        const errors = [] // Initialize error list

        if (!email) errors.push({ // If email is not specified, insert an error
            field: 'email',
            message: 'Please enter an email.',
        })
        else if (!checkEmail(email)) errors.push({ // Or the email is not matches with the valid pattern, insert an error
            field: 'email',
            message: 'The email address you entered is invalid.',
        })

        if (returnErrors(errors, res)) return // Check errors

        const user = await User.findOne({email})

        if (!user) errors.push({ // If there is no user, insert an error
            field: 'email',
            message: 'No user found for this email.',
        })

        if (returnErrors(errors, res)) return // Check errors


         // Create JWT token for reset password
        user.resetPasswordToken = jwt.sign({email}, process.env.JWT_KEY, {expiresIn: '1h'}) // Update user's reset token
        await user.save() // Save user

        sendMail({ // Send reset password mail
            email: user.email,
            ...config.resetPasswordMail(user.resetPasswordToken)
        }, (err) => {
            if (err) return res.status(500).json({ // If there is an error, return 500 response
                status: 'ERROR',
                message: 'An error occurred while sending reset password mail.',
                error: err,
            })
            else return res.status(201).json({ // Otherwise, return 201 response
                status: 'OK',
                message: 'Reset password mail sent.',
            })
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while sending password reset mail.',
            error: e.message,
        })
    }
}

export const postCheckPasswordToken = async (req, res) => {
    try {
        const {token} = req.body // Get token from request body

        if (!token) return res.status(400).json({ // If token is not specified, return 400 response
            status: 'ERROR',
            message: 'Token is required.',
        })

        jwt.verify(token, process.env.JWT_KEY, {}, async (err, decoded) => { // Decode JWT token
            if (err) {
                const user = await User.findOne({resetPasswordToken: token}) // Get user of sent reset password token

                if (!user) return res.status(404).json({ // If there is no user, return 404 response
                    status: 'USER_NOT_FOUND',
                    message: 'User not found.',
                })

                const resetToken = jwt.sign({email: user.email}, process.env.JWT_KEY, {expiresIn: '1h'})
                user.resetPasswordToken = resetToken // Update user's activation token
                await user.save() // Save user

                sendMail({ // Send reset password mail
                    email: user.email,
                    ...config.resetPasswordMail(resetToken)
                }, (err) => {
                    if (err) return res.status(500).json({ // If there is an error, return 500 response
                        status: 'ERROR',
                        message: 'An error occurred while sending activation mail.',
                        error: err,
                    })
                    else return res.status(404).json({ // Otherwise, return 404 response
                        status: 'TOKEN_EXPIRED',
                        message: 'Token expired.',
                        newToken: true,
                    })
                })
            } else {
                const {email} = decoded // Get email from decoded JWT token

                if (!email) return res.status(404).json({ // If there is no email, return 404 response
                    status: 'USER_NOT_FOUND',
                    message: 'User not found.',
                })

                const user = await User.findOne({email}) // Get user of sent email address

                if (!user) return res.status(404).json({ // If there is no user, return 404 response
                    status: 'USER_NOT_FOUND',
                    message: 'User not found.',
                })

                res.status(201).json({ // Return 201 response for valid token
                    status: 'OK',
                    message: 'Password reset token is valid.',
                })
            }
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while checking password reset token.',
            error: e.message,
        })
    }
}

export const postResetPassword = async (req, res) => {
    try {
        const errors = [] // Initialize error list
        const {token, password, passwordConfirm} = req.body // Get data from request body

        if (!token) return res.status(400).json({ // If token is not specified, insert an error
            status: 'ERROR',
            message: 'Token is required.',
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

        if (returnErrors(errors, res)) return // Check errors

        jwt.verify(token, process.env.JWT_KEY, {}, async (err, decoded) => { // Decode JWT token
            if (err) {
                const user = await User.findOne({resetPasswordToken: token}) // Get user of sent reset password token

                if (!user) return res.status(404).json({ // If there is no user, return 404 response
                    status: 'USER_NOT_FOUND',
                    message: 'User not found.',
                })

                const resetToken = jwt.sign({email: user.email}, process.env.JWT_KEY, {expiresIn: '1h'})
                user.resetPasswordToken = resetToken // Update user's activation token
                await user.save() // Save user

                sendMail({ // Send reset password mail
                    email: user.email,
                    ...config.resetPasswordMail(resetToken)
                }, (err) => {
                    if (err) return res.status(500).json({ // If there is an error, return 500 response
                        status: 'ERROR',
                        message: 'An error occurred while sending activation mail.',
                        error: err,
                    })
                    else return res.status(404).json({ // Otherwise, return 404 response
                        status: 'TOKEN_EXPIRED',
                        message: 'Token expired.',
                        newToken: true,
                    })
                })
            } else {
                const {email} = decoded // Get email from decoded JWT token

                if (!email) return res.status(404).json({ // If there is no email, return 404 response
                    status: 'USER_NOT_FOUND',
                    message: 'User not found.',
                })

                const user = await User.findOne({email}) // Get user of sent email address

                if (!user) return res.status(404).json({ // If there is no user, return 404 response
                    status: 'USER_NOT_FOUND',
                    message: 'User not found.',
                })

                user.password = encrypt(password) // Encrypt password
                user.resetPasswordToken = null // Set user's reset password token to null
                await user.save() // Save user

                res.status(201).json({ // Return 201 response
                    status: 'OK',
                    message: 'Password reset.',
                })
            }
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while resetting password.',
            error: e.message,
        })
    }
}

export const postUpdateProfile = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        const image = req.file // Get image from the request files
        const {user: userId} = req.query // Get user from the request query
        const {name, email, password, noImage, profileColor, accentColor} = req.body // Get data from the request body

        const user = userId ? await User.findById(userId) : req.user // Get user from the user ID

        if (!user) return res.status(404).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'User not found.',
        })

        if (userId && !req.user.admin) return res.status(401).json({ // If the user is not an admin, return an error
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        let newName = user.name
        let newEmail = user.email
        let newPass = user.password
        let newImage = user.image
        let newProfileColor = user.profileColor
        let newAccentColor = user.accentColor

        if (image || noImage === 'true') { // If image is defined or noImage is true
            const currentImagePath = join(__dirname, '..', 'public', 'uploads', user.image || '_') // Create current image path
            if (user.image && fs.existsSync(currentImagePath)) fs.unlinkSync(currentImagePath) // If the user has an image and the current image path is exists, delete the image file
        }

        if (checkUserName(name)) newName = name // If the name is defined and the length of the name is greater than 4, set new name
        if (checkEmail(email) && req.user?.admin) newEmail = email // If the email is defined and matches with the email pattern, set new email
        if (checkPassword(password) && req.user?.admin) newPass = encrypt(password) // If the password is defined and the length of the password is greater than 4, set new password
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
        if (req.user?.admin) {
            user.email = newEmail
            user.password = newPass
        }
        user.image = newImage
        user.profileColor = newProfileColor
        user.accentColor = newAccentColor

        await user.save() // Save user

        return res.status(200).json({ // Return success response
            status: 'OK',
            message: 'User profile updated.',
            image: newImage,
            name: newName,
            email: newEmail,
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
        if (!req.user) return res.status(401).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        const {name, email, currentPassword, newPassword, passwordConfirm} = req.body // Get data from the request body
        const {user} = req // Get user from the request

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

export const getUserLibrary = async (req, res) => {
    try {
        const {id} = req.params // Get ID from the request params
        const {user: userId} = req.query // Get user from the request query

        if (!id) return res.status(400).json({ // If ID is not specified, return an error
            status: 'ERROR',
            message: 'Bad request.',
        })

        const reqUser = userId ? await User.findById(userId) : null // Get user from the user ID

        if (!reqUser && userId) return res.status(404).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'User not found.',
        })

        const user = await User.findById(id).populate({ // Get user by ID and populate liked tracks and albums
            path: 'likedTracks',
            select: 'title audio duration explicit',
            populate: {
                path: 'album',
                select: 'title cover',
                populate: {
                    path: 'artist',
                    select: 'name',
                },
            },
        }).populate({
            path: 'likedAlbums',
            select: 'title cover',
            populate: {
                path: 'artist',
                select: 'name',
            },
            perDocumentLimit: 50,
        }).populate({
            path: 'likedPlaylists',
            select: 'title image owner',
            populate: {
                path: 'owner',
                select: 'name',
            },
            perDocumentLimit: 50,
        }).populate({
            path: 'likedPlaylists',
            select: 'title image owner',
            populate: {
                path: 'tracks',
                select: 'album',
                populate: {
                    path: 'album',
                    select: 'cover',
                }
            },
            perDocumentLimit: 50,
        }).populate({
            path: 'lastListenedTracks',
            select: 'title audio duration explicit liked',
            populate: {
                path: 'album',
                select: 'title cover',
                populate: {
                    path: 'artist',
                    select: 'name',
                },
            },
            perDocumentLimit: 50,
        })

        if (!user) return res.status(404).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'User not found.',
        })

        const playlists = await Playlist.find({owner: user._id}).populate({ // Get user's playlists
            path: 'owner',
            select: 'name image',
        }).populate({
            path: 'tracks',
            select: 'title audio duration explicit',
            populate: {
                path: 'album',
                select: 'title cover',
                populate: {
                    path: 'artist',
                    select: 'name image',
                },
            },
        }).limit(50)

        if (user?.lastListenedTracks?.length) {
            user.lastListenedTracks.map(track => { // Map tracks
                if ((reqUser || user)?.likedTracks?.length) track.liked = !!(reqUser || user).likedTracks.find(likedTrack => likedTrack._id.toString() === track._id.toString()) // If user liked tracks is defined, set liked state
            })
        }

        if (user?.likedTracks?.length) {
            user.likedTracks.map(track => { // Map tracks
                if ((reqUser || user)?.likedTracks?.length) track.liked = !!(reqUser || user).likedTracks.find(likedTrack => likedTrack._id.toString() === track._id.toString()) // If user liked tracks is defined, set liked state
            })
        }

        if (playlists?.length) {
            playlists.map(playlist => { // Map playlists
                const covers = []
                if (!playlist.image) // If there is no playlist image
                    playlist.tracks.forEach(track => { // Map tracks
                        if (track?.album?.cover && !covers.includes(track.album.cover) && covers.length < 4) covers.push(track.album.cover) // If track has album cover and covers array does not include it, push album cover to covers array
                    })
                playlist.covers = covers // Set covers array to playlist
            })
        }

        if (user?.likedPlaylists?.length) {
            user.likedPlaylists.map(playlist => { // Map playlists
                const covers = []
                if (!playlist.image) // If there is no playlist image
                    playlist.tracks.forEach(track => { // Map tracks
                        if (track?.album?.cover && !covers.includes(track.album.cover) && covers.length < 4) covers.push(track.album.cover) // If track has album cover and covers array does not include it, push album cover to covers array
                    })
                playlist.covers = covers // Set covers array to playlist
            })
        }

        res.status(200).json({ // Return user library
            status: 'OK',
            library: {
                tracks: user?.likedTracks?.reverse(),
                albums: user?.likedAlbums?.reverse(),
                likedPlaylists: user?.likedPlaylists?.reverse(),
                lastListenedTracks: user?.lastListenedTracks,
                playlists: playlists?.sort((a, b) => b.createdAt - a.createdAt),
            },
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while retrieving user library.',
            error: e.message,
        })
    }
}

export const postListenedTrack = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        const {id} = req.params // Get track ID from the request parameters

        if (!id) return res.status(400).json({ // If track ID is not specified, return an error
            status: 'ERROR',
            message: 'Bad request.',
        })

        const {user} = req // Get user from the request

        if (!user) return res.status(404).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'User not found.',
        })

        const track = await Track.findById(id).populate({ // Get track by ID and populate album and artist
            path: 'album',
            select: 'artist',
            populate: {
                path: 'artist',
                select: 'name',
            },
        })

        if (!track) return res.status(404).json({ // If there is no track, return an error
            status: 'ERROR',
            message: 'Track not found.',
        })

        if (!user?.lastListenedTracks) user.lastListenedTracks = [] // If user's last listened tracks is not defined, define it as an empty array
        else user.lastListenedTracks = user.lastListenedTracks.filter(listenedTrack => !!listenedTrack) // Filter undefined tracks
        if (track?._id) user.lastListenedTracks = [track._id, ...user.lastListenedTracks.filter(listenedTrack => listenedTrack?.toString() !== id)].slice(0, 50) // Add track to the beginning of the array and remove duplicates

        if (!user?.lastListenedArtists) user.lastListenedArtists = [] // If user's last listened artists is not defined, define it as an empty array
        else user.lastListenedArtists = user.lastListenedArtists.filter(listenedArtist => !!listenedArtist) // Filter undefined artists
        if (track?.album?.artist?._id) user.lastListenedArtists = [track.album.artist._id, ...user.lastListenedArtists?.filter(listenedArtist => listenedArtist?.toString() !== track?.album?.artist?._id?.toString())].slice(0, 20) // Add artist to the beginning of the array and remove duplicates

        if (!user?.lastListenedAlbums) user.lastListenedAlbums = [] // If user's last listened albums is not defined, define it as an empty array
        else user.lastListenedAlbums = user.lastListenedAlbums.filter(listenedAlbum => !!listenedAlbum) // Filter undefined albums
        if (track?.album?._id) user.lastListenedAlbums = [track.album._id, ...user.lastListenedAlbums?.filter(listenedAlbum => listenedAlbum?.toString() !== track?.album?._id?.toString())].slice(0, 20) // Add album to the beginning of the array and remove duplicates

        await user.save() // Save user

        track.plays++ // Increase track's play count
        await track.save() // Save track

        res.status(200).json({ // Return success response
            status: 'OK',
            message: 'Listened track updated.',
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while updating listened track.',
            error: e.message,
        })
    }
}

export const postFollowArtist = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        const {id} = req.params // Get artist ID from the request parameters
        const {follow} = req.body // Get follow status from the request body

        if (!id) return res.status(400).json({ // If artist ID is not specified, return an error
            status: 'ERROR',
            message: 'Bad request.',
        })

        const {user} = req // Get user from the request

        if (!user) return res.status(404).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'User not found.',
        })

        const artist = await Artist.findById(id) // Get artist by ID

        if (!artist) return res.status(404).json({ // If there is no artist, return an error
            status: 'ERROR',
            message: 'Artist not found.',
        })

        if (Number(follow) === -1 && user?.followedArtists?.find(a => a?.toString() === artist._id.toString())) user.followedArtists = user.followedArtists.filter(a => a.toString() !== artist._id.toString()) // If follow status is -1 and the user follows the artist, remove the artist from the user's followed artists
        else if (Number(follow) === 1 && !user?.followedArtists?.find(a => a?.toString() === artist._id.toString())) user.followedArtists = [artist._id, ...user.followedArtists] // If follow status is 1 and the user does not follow the artist, add the artist to the user's followed artists

        await user.save() // Save user

        res.status(200).json({ // Return success response
            status: 'OK',
            message: 'Followed artist updated.',
            followed: !!user?.followedArtists?.find(a => a?.toString() === artist._id.toString()),
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while updating followed artist.',
            error: e.message,
        })
    }
}

export const postFollowUser = async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'Unauthorized.',
        })

        const {id} = req.params // Get user ID from the request parameters
        const {follow} = req.body // Get follow status from the request body

        if (!id) return res.status(400).json({ // If artist ID is not specified, return an error
            status: 'ERROR',
            message: 'Bad request.',
        })

        const {user} = req // Get user from the request

        if (!user) return res.status(404).json({ // If there is no user, return an error
            status: 'ERROR',
            message: 'User not found.',
        })

        const fellowUser = await User.findById(id) // Get user by ID

        if (!fellowUser) return res.status(404).json({ // If there is no artist, return an error
            status: 'ERROR',
            message: 'User not found.',
        })

        if (Number(follow) === -1 && user?.followedUsers?.find(a => a?.toString() === fellowUser._id.toString())) user.followedUsers = user.followedUsers.filter(a => a.toString() !== fellowUser._id.toString()) // If follow status is -1 and the user follows the user, remove the user from the user's followed users
        else if (Number(follow) === 1 && !user?.followedUsers?.find(a => a?.toString() === fellowUser._id.toString())) user.followedUsers = [fellowUser._id, ...user.followedUsers] // If follow status is 1 and the user does not follow the user, add the user to the user's followed users

        await user.save() // Save user

        res.status(200).json({ // Return success response
            status: 'OK',
            message: 'Followed users updated.',
            followed: !!user?.followedUsers?.find(a => a?.toString() === fellowUser._id.toString()),
            followers: await getFollowers(fellowUser._id),
        })
    } catch (e) {
        res.status(500).json({ // Return 500 response when an error occurs
            status: 'ERROR',
            message: 'An error occurred while updating followed user.',
            error: e.message,
        })
    }
}