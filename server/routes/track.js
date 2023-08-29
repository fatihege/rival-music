import express from 'express'
import {getManifest, getTrack, getTrackInfo, getLyrics, getTracks, postLike} from '../controllers/track.js'
import auth from '../middlewares/auth.js'

const router = express.Router() // Create Express router instance

router.get('/manifest/:track', getManifest)
router.get('/info/:id', getTrackInfo)
router.get('/lyrics/:id', auth, getLyrics)
router.post('/like/:id', auth, postLike)
router.get('/:track', getTrack)
router.get('/', getTracks)

export default router