import express from 'express'
import {getManifest, getTrack, getTrackInfo, getLyrics, getTracks, postLike} from '../controllers/track.js'

const router = express.Router() // Create Express router instance

router.get('/', getTracks)
router.get('/:track', getTrack)
router.get('/manifest/:track', getManifest)
router.get('/info/:id', getTrackInfo)
router.get('/lyrics/:id', getLyrics)
router.post('/like/:id', postLike)

export default router