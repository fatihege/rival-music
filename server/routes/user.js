import express from 'express'
import {getUser, postRegisterUser, postLoginUser, postUpdateProfile, postUpdateUser} from '../controllers/user.js'
import {profilePhotoUpload} from '../lib/multer.js'

const router = express.Router() // Create Express router instance

router.get('/', getUser)
router.get('/:token', getUser)
router.post('/signup', postRegisterUser)
router.post('/login', postLoginUser)
router.post('/update-profile/:id', profilePhotoUpload.single('image'), postUpdateProfile)
router.post('/update/:id', postUpdateUser)

export default router