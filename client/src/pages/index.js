import Head from 'next/head'
import {useEffect, useRef, useState} from 'react'
import axios from 'axios'
import Slider from '@/components/slider'
import CustomScrollbar from '@/components/custom-scrollbar'
import styles from '@/styles/home.module.sass'

export default function HomePage() {
    const [artists, setArtists] = useState([]) // State of artists
    const [latestAlbums, setLatestAlbums] = useState([]) // State of albums
    const [items, _setItems] = useState([]) // State of slider items
    const itemsRef = useRef(items) // Reference for the slider items state

    const setItems = value => { // Update the items state value
        itemsRef.current = value
        _setItems(value)
    }

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
            const response = await axios.get(`${process.env.API_URL}/album?limit=50&sorting=-releaseYear&populate=artist`) // Get albums from the API
            if (response.data.status === 'OK' && response.data.albums?.length) // If the response is OK and there are albums
                setLatestAlbums(response.data.albums.map(a => {
                    a.type = 'album'
                    return a
                })) // Update the albums state value
        } catch (e) {
        }
    }

    useEffect(() => {
        for (let i = 0; i < 2; i++)
            for (let id = 1; id <= 6; id++)
                setItems([...itemsRef.current, {
                    id: id + i * 6,
                    title: id === 6 ? 'Ride The Lightning' : id === 5 ? 'Fear of the Dark (2015 Remaster)' : id === 4 ? 'Hells Bells' : id === 3 ? 'The Devil in I' : id === 2 ? 'Heaven and Hell - 2009 Remaster' : 'Seek & Destroy - Remastered',
                    artist: {
                        id,
                        name: id === 5 ? 'Iron Maiden' : id === 4 ? 'AC/DC' : id === 3 ? 'Slipknot' : id === 2 ? 'Black Sabbath' : 'Metallica'
                    },
                    cover: id === 6 ? 'album_cover_6.jpg' : id === 5 ? 'album_cover_5.jpg' : id === 4 ? 'album_cover_4.jpg' : id === 3 ? 'album_cover_3.jpg' : id === 2 ? 'album_cover_2.jpg' : 'album_cover_1.jpg',
                    type: 'track',
                }])

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
                        <Slider title="Rhythm of Sounds" items={itemsRef.current}/>
                        <Slider title="Gods of Metal" items={artists}/>
                        <Slider title="Highlights of Your Music World" items={itemsRef.current}/>
                        <Slider title="Latest Albums" items={latestAlbums}/>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}