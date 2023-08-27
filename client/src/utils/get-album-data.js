import axios from 'axios'

/**
 * @param {string} token
 * @param {string} id
 * @param {string | null} userId
 * @returns {Promise<*|null>}
 */
export default async (id, userId = null) => {
    try {
        const response = await axios.get(`${process.env.API_URL}/album/${id}?tracks=1${userId ? `&likes=1&user=${userId}` : ''}`) // Send GET request to the API
        if (!response.data || !response.data.album) return // If there is no data in the response, return

        return response.data.album // Return album data
    } catch (e) {
        return null
    }
}