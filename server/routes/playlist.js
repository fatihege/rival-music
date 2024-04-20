import express from 'express'
import {
    getPlaylist,
    getLikedPlaylists,
    getUserPlaylists,
    postPlay,
    postCreate,
    postUpdate,
    deletePlaylist,
    postAddTracks,
    postRemoveTracks,
    postReorder,
    getIsLiked,
    postLike
} from '../controllers/playlist.js'
import {profilePhotoUpload} from '../lib/multer.js'
import auth from '../middlewares/auth.js'

const router = express.Router() // Create Express router instance

router.post('/like/:id', auth, postLike)
router.post('/update/:id', auth, profilePhotoUpload.single('image'), postUpdate)
router.post('/create', auth, postCreate)
router.post('/add-tracks/:id', auth, postAddTracks)
router.post('/remove-tracks/:id', auth, postRemoveTracks)
router.post('/reorder/:id', auth, postReorder)
router.get('/is-liked/:id', auth, getIsLiked)
router.get('/liked/:id', getLikedPlaylists)
router.post('/play/:id', auth, postPlay)
router.get('/user/:id', getUserPlaylists)
router.delete('/:id', auth, deletePlaylist)
router.get('/:id', getPlaylist)

export default router