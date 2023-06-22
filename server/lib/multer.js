import multer from 'multer'
import {join} from 'path'
import checkDir from '../utils/check-dir.js'
import {__dirname} from '../utils/dirname.js'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = join(__dirname, '..', 'images')
        checkDir(dir)
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + file.originalname.slice(file.originalname.lastIndexOf('.')))
    },
    fileFilter: function (req, file, cb) {
        const acceptedMimeTypes = process.env.PP_FILETYPES.split(',')
        if (!acceptedMimeTypes.includes(file.mimetype)) cb(null, false)
        else cb(null, true)
    }
})

export const upload = multer({storage, limits: {
    fileSize: parseInt(process.env.PP_MAXSIZE),
}})
