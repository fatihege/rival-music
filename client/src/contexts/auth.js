import {createContext, useState} from 'react'

const AuthContext = createContext(null) // Create auth context

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null) // User record state

    return (
        <AuthContext.Provider value={[user]}>
            {children}
        </AuthContext.Provider>
    )
}

export {AuthContext, AuthProvider}
