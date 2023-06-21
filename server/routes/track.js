import express from 'express'
import {getManifest, getTrack} from '../controllers/track.js'

const router = express.Router() // Create Express router instance

router.get('/:track', getTrack)
router.get('/manifest/:track', getManifest)

export default router