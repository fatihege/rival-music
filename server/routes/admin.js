import express from 'express'
import {
    getStatistics,
    postCreateArtist,
    postUpdateArtist,
    deleteArtist,
    postCreateAlbum,
    postUpdateAlbum,
    deleteAlbum,
    postCreateTrack
} from '../controllers/admin.js'
import {upload, audio} from '../lib/multer.js'

const router = express.Router() // Create Express router instance

router.get('/statistics', getStatistics)
router.post('/artist/create', upload.fields([
    {name: 'banner', maxCount: 1},
    {name: 'profile', maxCount: 1},
]), postCreateArtist)
router.post('/artist/update/:id', upload.fields([
    {name: 'banner', maxCount: 1},
    {name: 'profile', maxCount: 1},
]), postUpdateArtist)
router.delete('/artist/:id', deleteArtist)
router.post('/album/create', upload.single('cover'), postCreateAlbum)
router.post('/album/update/:id', upload.single('cover'), postUpdateAlbum)
router.delete('/album/:id', deleteAlbum)
router.post('/track/create', audio.single('audio'), postCreateTrack)

export default router