import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import Slider from '@/components/slider'
import CustomScrollbar from '@/components/custom-scrollbar'
import styles from '@/styles/home.module.sass'
import Tracks from '@/components/tracks'
import ExtensibleTracks from '@/components/extensible-tracks'

export default function HomePage() {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [lastListenedPlaylists, setLastListenedPlaylists] = useState(null) // State of last listened playlists
    const [lastListenedTracks, setLastListenedTracks] = useState(null) // State of last listened tracks
    const [lastListenedAlbums, setLastListenedAlbums] = useState(null) // State of last listened albums
    const [lastListenedArtists, setLastListenedArtists] = useState(null) // State of last listened artists
    const [popularAlbums, setPopularAlbums] = useState(null) // State of popular albums
    const [popularArtists, setPopularArtists] = useState(null) // State of popular artists

    const getLastListenedPlaylists = async () => {
        if (!user?.loaded || !user?.token) return // If user is not loaded or there is no token, return

        try {
            const response = await axios.get(`${process.env.API_URL}/user/last-listened/playlist`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }) // Get playlists from the API
            if (response.data.status === 'OK' && response.data.list?.length) // If the response is OK and there are playlists
                setLastListenedPlaylists(response.data.list) // Update the playlists state value
            else setLastListenedPlaylists([]) // Otherwise, set playlists state to empty array
        } catch (e) {
            console.error(e)
        }
    }

    const getLastListenedTracks = async () => {
        if (!user?.loaded || !user?.token) return // If user is not loaded or there is no token, return

        try {
            const response = await axios.get(`${process.env.API_URL}/user/last-listened/track`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }) // Get tracks from the API
            if (response.data.status === 'OK' && response.data.list?.length) // If the response is OK and there are track
                setLastListenedTracks(response.data.list) // Update the track state value
            else setLastListenedTracks([]) // Otherwise, set track state to empty array
        } catch (e) {
            console.error(e)
        }
    }

    const getLastListenedAlbums = async () => {
        if (!user?.loaded || !user?.token) return // If user is not loaded or there is no token, return

        try {
            const response = await axios.get(`${process.env.API_URL}/user/last-listened/album`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }) // Get tracks from the API
            if (response.data.status === 'OK' && response.data.list?.length) // If the response is OK and there are album
                setLastListenedAlbums(response.data.list) // Update the album state value
            else setLastListenedAlbums([]) // Otherwise, set album state to empty array
        } catch (e) {
            console.error(e)
        }
    }

    const getLastListenedArtists = async () => {
        if (!user?.loaded || !user?.token) return // If user is not loaded or there is no token, return

        try {
            const response = await axios.get(`${process.env.API_URL}/user/last-listened/artist`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }) // Get tracks from the API
            if (response.data.status === 'OK' && response.data.list?.length) // If the response is OK and there are artist
                setLastListenedArtists(response.data.list) // Update the artist state value
            else setLastListenedArtists([]) // Otherwise, set artist state to empty array
        } catch (e) {
            console.error(e)
        }
    }

    const getPopularAlbums = async () => {
        if (!user?.loaded || !user?.token) return // If user is not loaded or there is no token, return

        try {
            const response = await axios.get(`${process.env.API_URL}/album/popular`) // Get popular albums from the API
            if (response.data.status === 'OK') setPopularAlbums(response.data.albums) // Update the album state value
            else setPopularAlbums([]) // Otherwise, set album state to empty array
        } catch (e) {
            console.error(e)
        }
    }

    const getPopularArtists = async () => {
        if (!user?.loaded || !user?.token) return // If user is not loaded or there is no token, return

        try {
            const response = await axios.get(`${process.env.API_URL}/artist/popular`) // Get popular artists from the API
            if (response.data.status === 'OK') setPopularArtists(response.data.artists) // Update the artist state value
            else setPopularArtists([]) // Otherwise, set artist state to empty array
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (user?.loaded && (!user?.id || !user?.token)) {
            router.push('/explore')
            return
        }

        if (!user?.loaded || !user?.token) return // If user is not loaded or there is no token, return

        getLastListenedPlaylists() // Get last listened playlists from the API
        getLastListenedTracks() // Get last listened tracks from the API
        getLastListenedAlbums() // Get last listened albums from the API
        getLastListenedArtists() // Get last listened artists from the API
        getPopularAlbums() // Get popular albums from the API
        getPopularArtists() // Get popular artists from the API
    }, [user])

    return (
        <>
            <Head>
                <title>Rival Music</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <h1 className={styles.pageTitle}>Listen Now</h1>
                        {lastListenedPlaylists?.length ? <Slider type={'playlist'} title="Last listened playlists" items={lastListenedPlaylists}/> : ''}
                        {lastListenedTracks?.length ? <ExtensibleTracks title="Last listened tracks" items={lastListenedTracks} likedTracks={lastListenedTracks?.filter(track => track?.liked)} set={setLastListenedTracks}/> : ''}
                        {lastListenedAlbums?.length ? <Slider type={'album'} title="Last listened albums" items={lastListenedAlbums}/> : ''}
                        {lastListenedArtists?.length ? <Slider type={'artist'} title="Last listened artists" items={lastListenedArtists}/> : ''}
                        {popularAlbums?.length ? <Slider type={'album'} title="Users love these" items={popularAlbums}/> : ''}
                        {popularArtists?.length ? <Slider type={'artist'} title="Popular artists nowadays" items={popularArtists}/> : ''}
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}