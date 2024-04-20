import {fileURLToPath} from 'url'
import {dirname} from 'path'

export const __filename = fileURLToPath(import.meta.url) // Get file name
export const __dirname = dirname(__filename) // Get directory of file