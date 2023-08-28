import Head from 'next/head'
import {useEffect, useRef, useState} from 'react'
import axios from 'axios'
import Slider from '@/components/slider'
import CustomScrollbar from '@/components/custom-scrollbar'
import styles from '@/styles/home.module.sass'

export default function HomePage() {
    const [artists, setArtists] = useState([]) // State of artists
    const [latestAlbums, setLatestAlbums] = useState([]) // State of albums

    const getArtists = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/artist/genre/metal?limit=40&includes=in`) // Get artists from the API by genre
            if (response.data.status === 'OK' && response.data.artists?.length) // If the response is OK and there are artists
                setArtists(response.data.artists.map(a => {
                    a.type = 'artist'
                    return a
                })) // Update the artists state value
        } catch (e) {
        }
    }

    const getLatestAlbums = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/album?limit=50&sorting=-releaseYear`) // Get albums from the API
            if (response.data.status === 'OK' && response.data.albums?.length) // If the response is OK and there are albums
                setLatestAlbums(response.data.albums.map(a => {
                    a.type = 'album'
                    return a
                })) // Update the albums state value
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
                <title>Rival Music</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <h1 className={styles.pageTitle}>Listen Now</h1>
                        <Slider title="Latest Albums" items={latestAlbums}/>
                        <Slider title="Gods of Metal" items={artists}/>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}