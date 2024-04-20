import {createContext, useContext, useEffect, useState} from 'react'
import axios from 'axios'
import {AlertContext} from '@/contexts/alert'
import getUserData from '@/utils/get-user-data'

const AuthContext = createContext(null) // Create auth context

const AuthProvider = ({children}) => {
    const [, setAlert] = useContext(AlertContext) // Use alert context
    const [user, setUser] = useState({ // User data
        loaded: false,
    })
    const getUser = async () => {
        const token = localStorage.getItem('token') // Get token from local storage

        if (token?.length) { // If there is a token
            try {
                let tmpUser = null

                const response = await axios.get(`${process.env.API_URL}/user/${token}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }) // Send a GET request for user info
                if (response.data?.status === 'OK') {
                    tmpUser = {loaded: true, token, ...response.data.user} // If response is OK, update user
                    const colorData = await getUserData(response.data.user.id, 'profileColor,accentColor,image')

                    if (colorData?.profileColor) tmpUser.profileColor = colorData.profileColor
                    if (colorData?.accentColor) tmpUser.accentColor = colorData.accentColor

                    setUser(tmpUser)
                }
            } catch (e) {
                setUser({loaded: true}) // User data is loaded

                if (e?.response?.data?.status === 'NOT_ACCEPTED') { // If there is NOT_ACCEPTED error
                    localStorage.removeItem('token') // Remove token from local storage
                    setAlert({ // Show an alert
                        active: true,
                        title: 'Account not accepted',
                        description: 'Your account is not accepted by the site owner. Please wait while your account is accepted.',
                        button: 'OK',
                        type: '',
                    })
                }
                else if (e?.response?.data?.status === 'NOT_ACTIVATED') // If there is NOT_ACTIVATED error
                    setAlert({ // Show an alert
                        active: true,
                        title: 'Account not activated',
                        description: 'You must activate your account to use the app. We sent you an activation link to your email address.',
                        button: 'OK',
                        type: '',
                    })
            }
        } else {
            setUser({loaded: true}) // User data is loaded
        }
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