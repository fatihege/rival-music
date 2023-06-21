import express from 'express'
import bodyParser from 'body-parser'
import {getUser, postRegisterUser, postLoginUser} from '../controllers/user.js'

const router = express.Router() // Create Express router instance

router.get('/:token', getUser)
router.post('/signup', bodyParser.json(), postRegisterUser)
router.post('/login', bodyParser.json(), postLoginUser)

export default router