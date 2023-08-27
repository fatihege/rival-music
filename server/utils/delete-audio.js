import {unlink} from 'fs'
import {join} from 'path'
import {__dirname} from './dirname.js'

export default async audio => {
    await unlink(join(__dirname, '..', 'audio', 'manifest', audio?.slice(0, audio?.lastIndexOf('.')) + '.ts'), () => {}) // Delete audio file
    await unlink(join(__dirname, '..', 'audio', 'manifest', audio?.slice(0, audio?.lastIndexOf('.')) + '.m3u8'), () => {}) // Delete audio file
}