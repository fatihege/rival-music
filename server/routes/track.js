import express from 'express'
import {getManifest, getTrack, getTrackInfo, getUserTracks, postGetQueue, getLyrics, getTracks, getTracksByAlbum, postLike} from '../controllers/track.js'
import auth from '../middlewares/auth.js'

const router = express.Router() // Create Express router instance

router.get('/manifest/:track', getManifest)
router.get('/info/:id', getTrackInfo)
router.post('/queue', postGetQueue)
router.get('/lyrics/:id', auth, getLyrics)
router.post('/like/:id', auth, postLike)
router.get('/album/:id', getTracksByAlbum)
router.get('/user/:id', getUserTracks)
router.get('/:track', getTrack)
router.get('/', getTracks)

export default router