import express from 'express'
import {getUser, postRegisterUser, postLoginUser, postUpdateProfile} from '../controllers/user.js'
import {upload} from '../lib/multer.js'

const router = express.Router() // Create Express router instance

router.get('/', getUser)
router.get('/:token', getUser)
router.post('/signup', postRegisterUser)
router.post('/login', postLoginUser)
router.post('/update-profile/:id', upload.single('image'), postUpdateProfile)

export default router