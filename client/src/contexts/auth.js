import {createContext, useEffect, useState} from 'react'
import axios from 'axios'
import getUserData from '@/utils/get-user-data'

const AuthContext = createContext(null) // Create auth context

const AuthProvider = ({children}) => {
    const [user, setUser] = useState({ // User data
        loaded: false,
    })

    const getUser = async () => {
        const token = localStorage.getItem('token') // Get token from local storage

        if (token?.length) { // If there is a token
            try {
                let tmpUser = null

                const response = await axios.get(`${process.env.API_URL}/user/${token}`) // Send a GET request for user info
                if (response.data?.status === 'OK') {
                    tmpUser = {loaded: true, token, ...response.data.user} // If response is OK, update user
                    const colorData = await getUserData(response.data.user.id, 'profileColor,accentColor')

                    if (colorData?.profileColor) tmpUser.profileColor = colorData.profileColor
                    if (colorData?.accentColor) tmpUser.accentColor = colorData.accentColor

                    setUser(tmpUser)
                }
            } catch (e) {
                setUser({loaded: true}) // User data is loaded
            }
        } else setUser({loaded: true}) // User data is loaded
    }

    useEffect(() => {
        if (!localStorage) return // If localStorage is undefined, return
        getUser() // Get user data
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
