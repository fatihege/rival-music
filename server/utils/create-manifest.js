import {exec as execCmd} from 'child_process'
import {promisify} from 'util'
import {existsSync} from 'fs'
const exec = promisify(execCmd) // Promisify exec function

export default async (trackPath, destination) => {
    if (!existsSync(trackPath)) return {err: new Error('Track file is not exists')} // If track file is not exists, return error
    return await exec(`ffmpeg -i ${trackPath} -c copy -level 3.0 -start_number 0 -hls_time 10 -hls_list_size 0 -hls_flags single_file -f hls ${destination}.m3u8`) // Execute FFmpeg command
}