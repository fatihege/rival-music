import axios from 'axios'

/**
 * @param {string} token
 * @param {string} id
 * @returns {Promise<*|null>}
 */
export default async id => {
    try {
        const response = await axios.get(`${process.env.API_URL}/artist/${id}`) // Send GET request to the API
        if (!response.data || !response.data.artist) return // If there is no data in the response, return

        return response.data.artist // Return artist data
    } catch (e) {
        return null
    }
}