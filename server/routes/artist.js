import express from 'express'
import {getArtist, getArtistByGenre, getArtists} from '../controllers/artist.js'

const router = express.Router() // Create Express router instance

router.get('/:id', getArtist)
router.get('/genre/:genre', getArtistByGenre)
router.get('/', getArtists)

export default router