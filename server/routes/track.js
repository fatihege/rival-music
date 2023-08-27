import express from 'express'
import {getManifest, getTrack, getTrackInfo, getTracks, postLike} from '../controllers/track.js'

const router = express.Router() // Create Express router instance

router.get('/', getTracks)
router.get('/:track', getTrack)
router.get('/manifest/:track', getManifest)
router.get('/info/:id', getTrackInfo)
router.post('/like/:id', postLike)

export default router