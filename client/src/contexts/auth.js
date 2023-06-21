import {createContext, useEffect, useState} from 'react'
import axios from 'axios'

const AuthContext = createContext(null) // Create auth context

const AuthProvider = ({children}) => {
    const [user, setUser] = useState({ // User data
        loaded: false,
    })

    useEffect(() => {
        if (!localStorage) return // If localStorage is undefined, return

        (async () => {
            const token = localStorage.getItem('token') // Get token from local storage

            if (token?.length) { // If there is a token
                try {
                    const response = await axios.get(`${process.env.API_URL}/user/${token}`) // Send a GET request for user info
                    if (response.data?.status === 'OK') setUser({loaded: true, token, ...response.data.user}) // If response is OK, update user state
                } catch (e) {
                    setUser({loaded: true}) // User data is loaded
                }
            } else setUser({loaded: true}) // User data is loaded
        })()
    }, [])

    useEffect(() => { // If user state value changes
        const token = localStorage.getItem('token') // Get token from localStorage
        if (user.token && typeof user.token === 'string' && (!token || !token.length || user.token !== token)) // If user has a token, and the token is string, and there is no token field in local storage or the token of the user is not equals to the local token
            localStorage.setItem('token', user.token) // Update token value in local storage
    }, [user])

    return (
        <AuthContext.Provider value={[user, setUser]}>
            {children}
        </AuthContext.Provider>
    )
}

export {AuthContext, AuthProvider}
