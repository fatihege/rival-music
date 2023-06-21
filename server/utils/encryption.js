import crypto from 'crypto'

export const encrypt = data => {
    const cipher = crypto.createCipheriv(process.env.CRYPTO_ALGORITHM, process.env.CRYPTO_KEY, process.env.CRYPTO_IV) // Create cipher
    let encrypted = cipher.update(data, 'utf8', 'hex') // Initialize encrypted data
    encrypted += cipher.final('hex') // Finish encryption
    return encrypted // Return encrypted data
}

export const decrypt = data => {
    const decipher = crypto.createDecipheriv(process.env.CRYPTO_ALGORITHM, process.env.CRYPTO_KEY, process.env.CRYPTO_IV) // Create decipher
    let decrypted = decipher.update(data, 'hex', 'utf8') // Initialize decrypted data
    decrypted += decipher.final('utf8') // Finish decryption
    return decrypted // Return decrypted data
}