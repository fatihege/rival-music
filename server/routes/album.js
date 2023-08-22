import express from 'express'
import {getAlbum, getAlbums, getAlbumsByArtist} from '../controllers/album.js'

const router = express.Router() // Create Express router instance

router.get('/:id', getAlbum)
router.get('/', getAlbums)
router.get('/artist/:id', getAlbumsByArtist)

export default router