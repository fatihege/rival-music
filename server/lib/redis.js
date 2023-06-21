import {createClient} from 'redis'

const client = createClient({ // Create Redis client
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
})

client.on('error', err => console.error('Redis Client Error:', err))
client.on('connect', () => console.log('Redis Client Connected'))

export default client