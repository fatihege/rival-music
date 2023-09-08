import Head from 'next/head'
import {useEffect, useRef, useState} from 'react'
import axios from 'axios'
import Slider from '@/components/slider'
import CustomScrollbar from '@/components/custom-scrollbar'
import styles from '@/styles/home.module.sass'

export default function HomePage() {
    const [artists, setArtists] = useState(null) // State of artists
    const [latestAlbums, setLatestAlbums] = useState(null) // State of albums

    const getArtists = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/artist/genre/metal?limit=40&includes=in`) // Get artists from the API by genre
            if (response.data.status === 'OK' && response.data.artists?.length) // If the response is OK and there are artists
                setArtists(response.data.artists) // Update the artists state value
            else setArtists([]) // Otherwise, set artists state to empty array
        } catch (e) {
        }
    }

    const getLatestAlbums = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/album?limit=50&sorting=-releaseYear`) // Get albums from the API
            if (response.data.status === 'OK' && response.data.albums?.length) // If the response is OK and there are albums
                setLatestAlbums(response.data.albums) // Update the albums state value
            else setLatestAlbums([]) // Otherwise, set albums state to empty array
        } catch (e) {
        }
    }

    useEffect(() => {
        getArtists() // Get artists from the API
        getLatestAlbums() // Get albums from the API
    }, [])

    return (
        <>
            <Head>
                <title>{process.env.APP_NAME}</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <h1 className={styles.pageTitle}>Listen Now</h1>
                        <Slider type={'album'} title="Latest Albums" items={latestAlbums}/>
                        <Slider type={'artist'} title="Gods of Metal" items={artists}/>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}