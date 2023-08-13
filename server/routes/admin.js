import express from 'express'
import {getStatistics, postCreateArtist, postUpdateArtist, deleteArtist} from '../controllers/admin.js'
import {multipleUpload} from '../lib/multer.js'

const router = express.Router() // Create Express router instance

router.get('/statistics', getStatistics)
router.post('/artist/create', multipleUpload.fields([
    {name: 'banner', maxCount: 1},
    {name: 'profile', maxCount: 1},
]), postCreateArtist)
router.post('/artist/update/:id', multipleUpload.fields([
    {name: 'banner', maxCount: 1},
    {name: 'profile', maxCount: 1},
]), postUpdateArtist)
router.delete('/artist/:id', deleteArtist)

export default router