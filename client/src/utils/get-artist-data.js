import axios from 'axios'

/**
 * @param {string} token
 * @param {string} id
 * @param {string} userId
 * @returns {Promise<*|null>}
 */
export default async (id, userId) => {
    try {
        const response = await axios.get(`${process.env.API_URL}/artist/${id}${userId ? `?user=${userId}` : ''}`) // Send GET request to the API
        if (!response.data || !response.data.artist) return // If there is no data in the response, return

        return response.data.artist // Return artist data
    } catch (e) {
        return null
    }
}