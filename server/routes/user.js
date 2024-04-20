import express from 'express'
import {
    getUser,
    getUsers,
    getLastListened,
    postRegisterUser,
    postLoginUser,
    postActivateUser,
    postForgotPassword,
    postCheckPasswordToken,
    postResetPassword,
    postUpdateProfile,
    postUpdateUser,
    getUserLibrary,
    postListenedTrack,
    postFollowArtist,
    postFollowUser
} from '../controllers/user.js'
import {profilePhotoUpload} from '../lib/multer.js'
import auth from '../middlewares/auth.js'

const router = express.Router() // Create Express router instance

router.post('/signup', postRegisterUser)
router.post('/login', postLoginUser)
router.post('/activate', postActivateUser)
router.post('/forgot-password', postForgotPassword)
router.post('/check-password-token', postCheckPasswordToken)
router.post('/reset-password', postResetPassword)
router.post('/update-profile', auth, profilePhotoUpload.single('image'), postUpdateProfile)
router.post('/update', auth, postUpdateUser)
router.get('/library/:id', auth, getUserLibrary)
router.post('/listened/:id', auth, postListenedTrack)
router.post('/follow/artist/:id', auth, postFollowArtist)
router.post('/follow/user/:id', auth, postFollowUser)
router.get('/last-listened/:type', auth, getLastListened)
router.get('/all', getUsers)
router.get('/:token', getUser)
router.get('/', getUser)

export default router