import axios from 'axios'
import {useRouter} from 'next/router'
import {createContext, useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'

const LibraryContext = createContext(null)

const LibraryProvider = ({children}) => {
    const router = useRouter()
    const [user] = useContext(AuthContext) // Get user from AuthContext
    const [library, setLibrary] = useState(null) // Create library state

    useEffect(() => {
        if (!user?.loaded) return
        if (!user?.id || !user?.token) return setLibrary([]) // If user is not logged in, set library to empty array

        if (router.asPath === `/profile/${user?.id}`) return // If route is profile, return
        getUserLibrary() // Get user library
    }, [user])

    const getUserLibrary = async () => {
        if (!user?.loaded || !user?.id || !user?.token) return // If user is not defined, return

        try {
            const response = await axios.get(`${process.env.API_URL}/user/library/${user?.id}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            }) // Get user library from the server

            if (response.data.status === 'OK' && response.data?.library) setLibrary(response.data.library) // If response is OK, set library
            else setLibrary([]) // Otherwise, set library to empty array
        } catch (e) {
            console.error(e) // Log error to console
        }
    }

    const getLibraryById = async (id) => {
        if (!user?.loaded || !user?.id || !user?.token) return // If user is not defined, return

        try {
            const response = await axios.get(`${process.env.API_URL}/user/library/${id}?user=${user?.id}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            }) // Get user library from the server

            if (response.data.status === 'OK' && response.data?.library) return response.data.library // If response is OK, return library
            else return [] // Otherwise, return empty array
        } catch (e) {
            console.error(e) // Log error to console
        }
    }

    return (
        <LibraryContext.Provider value={[library, setLibrary, getUserLibrary, getLibraryById]}>
            {children}
        </LibraryContext.Provider>
    )
}

export {LibraryContext, LibraryProvider}