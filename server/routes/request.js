import express from 'express'
import {getRequestsByUser, getCanRequest, getUserCanRequest, postRequest} from '../controllers/request.js'
import auth from '../middlewares/auth.js'

const router = express.Router() // Create Express router instance

router.get('/can-request/:id', auth, getUserCanRequest)
router.get('/can-request', getCanRequest)
router.get('/user/:id', auth, getRequestsByUser)
router.post('/', auth, postRequest)

export default router