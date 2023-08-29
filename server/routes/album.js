import express from 'express'
import {getAlbum, getAlbums, getAlbumsByArtist, postLike} from '../controllers/album.js'
import auth from '../middlewares/auth.js'

const router = express.Router() // Create Express router instance

router.get('/artist/:id', getAlbumsByArtist)
router.post('/like/:id', auth, postLike)
router.get('/:id', getAlbum)
router.get('/', getAlbums)

export default router