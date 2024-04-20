import express from 'express'
import {
    getAlbum,
    getAlbums,
    getAlbumsByArtist,
    getPopularAlbums,
    getUserAlbums,
    getIsLiked,
    postLike
} from '../controllers/album.js'
import auth from '../middlewares/auth.js'

const router = express.Router() // Create Express router instance

router.get('/artist/:id', getAlbumsByArtist)
router.post('/like/:id', auth, postLike)
router.get('/is-liked/:id', auth, getIsLiked)
router.get('/user/:id', getUserAlbums)
router.get('/popular', getPopularAlbums)
router.get('/:id', getAlbum)
router.get('/', getAlbums)

export default router