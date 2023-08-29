import axios from 'axios'

/**
 * @param {string} id
 * @param {string} props
 * @returns {Promise<*|null>}
 */
export default async (id, props) => {
    try {
        const response = await axios.get(`${process.env.API_URL}/user/?id=${id}&props=${props}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }) // Send GET request to the API
        if (!response.data || !response.data.user) return // If there is no data in the response, return

        return response.data.user // Return user data
    } catch (e) {
        console.error(e.message)
        return null
    }
}