import fs from 'fs'

export default dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true})
}
