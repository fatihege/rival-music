import express from 'express'
import {getArtist, getArtistByGenre, getArtists, getIsFollowed, getPopularArtists, getArtistEssentials} from '../controllers/artist.js'
import auth from '../middlewares/auth.js'

const router = express.Router() // Create Express router instance

router.get('/essentials/:id', getArtistEssentials)
router.get('/genre/:genre', getArtistByGenre)
router.get('/popular', getPopularArtists)
router.get('/is-followed/:id', auth, getIsFollowed)
router.get('/:id', getArtist)
router.get('/', getArtists)

export default router