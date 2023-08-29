import express from 'express'
import {
    getUser,
    postRegisterUser,
    postLoginUser,
    postUpdateProfile,
    postUpdateUser,
    getUserLibrary,
    postListenedTrack
} from '../controllers/user.js'
import {profilePhotoUpload} from '../lib/multer.js'
import auth from '../middlewares/auth.js'

const router = express.Router() // Create Express router instance

router.post('/signup', postRegisterUser)
router.post('/login', postLoginUser)
router.post('/update-profile', auth, profilePhotoUpload.single('image'), postUpdateProfile)
router.post('/update', auth, postUpdateUser)
router.get('/library', auth, getUserLibrary)
router.post('/listened/:id', auth, postListenedTrack)
router.get('/:token', getUser)
router.get('/', auth, getUser)

export default router