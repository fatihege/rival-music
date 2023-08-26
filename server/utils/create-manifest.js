import {exec as execCmd} from 'child_process'
import {promisify} from 'util'
const exec = promisify(execCmd) // Promisify exec function

export default async (trackPath, destination) => await exec(`ffmpeg -i ${trackPath} -c copy -level 3.0 -start_number 0 -hls_time 10 -hls_list_size 0 -hls_flags single_file -f hls ${destination}.m3u8`) // Execute FFmpeg command