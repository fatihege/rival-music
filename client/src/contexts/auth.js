import {createContext, useState} from 'react'


const AuthContext = createContext(null)

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)

    return (
        <AuthContext.Provider value={[user]}>
            {children}
        </AuthContext.Provider>
    )
}

export {AuthContext, AuthProvider}
