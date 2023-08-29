import axios from 'axios'
import {createContext, useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'

const LibraryContext = createContext(null)

const LibraryProvider = ({children}) => {
    const [user] = useContext(AuthContext) // Get user from AuthContext
    const [library, setLibrary] = useState([]) // Create library state

    useEffect(() => {
        if (!user?.loaded) return
        if (!user?.id || !user?.token) return setLibrary([]) // If user is not logged in, set library to empty array

        getUserLibrary() // Get user library
    }, [user])

    const getUserLibrary = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/user/library`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }) // Get user library from the server
            if (response.data.status === 'OK' && response.data?.library) {
                setLibrary(makeLibraryRegular(response.data.library)) // If response is OK, set library
            }
        } catch (e) {
            console.error(e) // Log error to console
        }
    }

    const makeLibraryRegular = libraryData => {
        const libraryClone = {...libraryData} // Clone library

        libraryClone?.albums?.map(album => { // Set album type
            album.type = 'album'
            return album
        })

        libraryClone?.tracks?.map(track => { // Set track type
            track.type = 'track'
            return track
        })

        libraryClone?.lastListenedTracks?.map(track => { // Set track type
            track.type = 'track'
            return track
        })

        libraryClone?.playlists?.map(playlist => { // Set playlist type
            playlist.type = 'playlist'
            return playlist
        })

        return libraryData
    }

    return (
        <LibraryContext.Provider value={[library, setLibrary, getUserLibrary]}>
            {children}
        </LibraryContext.Provider>
    )
}

export {LibraryContext, LibraryProvider}