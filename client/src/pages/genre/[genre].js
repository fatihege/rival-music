import axios from 'axios'
import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import Slider from '@/components/slider'
import ExtensibleTracks from '@/components/extensible-tracks'
import nameGenre from '@/utils/name-genre'
import styles from '@/styles/explore.module.sass'

export function getServerSideProps(context) {
    return {
        props: {
            genre: context.params.genre,
        },
    }
}

export default function GenrePage({genre}) {
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get user data from auth context
    const [topAlbums, setTopAlbums] = useState(null) // Top albums state
    const [topTracks, setTopTracks] = useState(null) // Top tracks state
    const [topArtists, setTopArtists] = useState(null) // Top artists state
    const [newAlbums, setNewAlbums] = useState(null) // New albums state
    const [newArtists, setNewArtists] = useState(null) // New artists state

    useEffect(() => {
        if (!user?.loaded || !user?.id || !user?.token) return // If user is not loaded or not logged in, return

        if (genre?.length) { // If genre is defined
            axios.get(`${process.env.API_URL}/explore/genre/${genre}${user?.id ? `?user=${user.id}` : ''}`).then(res => {
                if (res.data?.status === 'OK' && res.data?.data) { // If response is OK and data is defined, set states
                    setTopAlbums(res.data.data.topAlbums)
                    setTopTracks(res.data.data.topTracks)
                    setTopArtists(res.data.data.topArtists)
                    setNewAlbums(res.data.data.newAlbums)
                    setNewArtists(res.data.data.newArtists)

                    if (
                        !res.data.data.topAlbums?.length &&
                        !res.data.data.topTracks?.length &&
                        !res.data.data.topArtists?.length &&
                        !res.data.data.newAlbums?.length &&
                        !res.data.data.newArtists?.length
                    ) router.push('/explore') // If all data is empty, redirect to explore page
                } else router.push('/explore') // If error occurred, redirect to explore page
            }).catch(() => router.push('/explore')) // If error occurred, redirect to explore page
        } else router.push('/explore') // If genre is not defined, redirect to explore page
    }, [user])

    return (
        <>
            <Head>
                <title>Genre — Rival Music</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Top {nameGenre(genre)} Drops</h1>
                {topAlbums?.length ? (
                    <Slider title="Top albums" type={'album'} items={topAlbums}/>
                ) : ''}
                {topTracks?.length ? (
                    <ExtensibleTracks title="Top tracks" items={topTracks} likedTracks={topTracks} set={setTopTracks}/>
                ) : ''}
                {topArtists?.length ? (
                    <Slider title="Top artists" type={'artist'} items={topArtists}/>
                ) : ''}
                {newAlbums?.length ? (
                    <Slider title="Latest albums" type={'album'} items={newAlbums}/>
                ) : ''}
                {newArtists?.length ? (
                    <Slider title="Latest artists" type={'artist'} items={newArtists}/>
                ) : ''}
            </div>
        </>
    )
}