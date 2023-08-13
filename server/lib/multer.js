import multer from 'multer'
import {join} from 'path'
import checkDir from '../utils/check-dir.js'
import {__dirname} from '../utils/dirname.js'

const storage = multer.diskStorage({ // Create multer storage
    destination: function (req, file, cb) {
        const dir = join(__dirname, '..', 'public', 'uploads') // Get path to the uploads directory
        checkDir(dir) // Check directory and create if is not exist
        cb(null, dir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9) // Create random file name
        cb(null, uniqueSuffix + file.originalname.slice(file.originalname.lastIndexOf('.')))
    },
    fileFilter: function (req, file, cb) {
        const acceptedMimeTypes = process.env.PP_FILETYPES.split(',') // Get accepted MIME types from environment variables
        if (!acceptedMimeTypes.includes(file.mimetype)) cb(null, false) // If the file is not accepted, return false
        else cb(null, true)
    }
})

export const profilePhotoUpload = multer({storage, limits: { // Create upload function
    fileSize: parseInt(process.env.PP_MAXSIZE),
}})

export const multipleUpload = multer({storage})