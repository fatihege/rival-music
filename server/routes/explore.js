import express from 'express'
import {getPopularTriple, getGenres, getGenre, getSearch} from '../controllers/explore.js'

const router = express.Router() // Create Express router instance

router.get('/search/:query', getSearch)
router.get('/popular-triple', getPopularTriple)
router.get('/genres', getGenres)
router.get('/genre/:genre', getGenre)

export default router