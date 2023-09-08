import axios from 'axios'
import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useState} from 'react'
import Link from '@/components/link'
import {AuthContext} from '@/contexts/auth'
import Slider from '@/components/slider'
import styles from '@/styles/library.module.sass'

export default function LibraryPlaylistPage() {
    const router = useRouter() // Create Next router instance
    const [user] = useContext(AuthContext) // Get user from AuthContext
    const [playlists, setPlaylists] = useState(null) // Create playlists state
    const [likedPlaylists, setLikedPlaylists] = useState(null) // Create liked playlists state

    const getPlaylists = async () => {
        if (!user?.id) return // If user is not logged in, don't do anything
        const response = await axios.get(`${process.env.API_URL}/playlist/user/${user.id}`) // Get user's playlists
        if (response.data.status === 'OK') setPlaylists(response.data?.playlists || []) // Set user's playlists
    }

    const getLikedPlaylists = async () => {
        if (!user?.id) return // If user is not logged in, don't do anything
        const response = await axios.get(`${process.env.API_URL}/playlist/liked/${user.id}`) // Get user's liked playlists
        if (response.data.status === 'OK') setLikedPlaylists(response.data?.playlists || []) // Set user's liked playlists
    }

    useEffect(() => {
        if (user?.loaded && (!user?.id || !user?.token)) {
            router.push('/')
            return
        }

        getPlaylists() // Get user's playlists
        getLikedPlaylists() // Get user's liked playlists
    }, [user])

    return user?.loaded && user?.id && user?.token ? (
        <>
            <Head>
                <title>Playlists — Rival Music</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Saved playlists</h1>
                <div className={styles.topSection}>
                    <Link href={'/library/tracks'}>
                        Favourite tracks
                    </Link>
                    <Link href={'/library/albums'}>
                        Favourite albums
                    </Link>
                </div>
                <Slider type={'playlist'} title="Playlists created by you" items={playlists}/>
                <Slider type={'playlist'} title="Your favourite playlists" items={likedPlaylists}/>
            </div>
        </>
    ) : ''
}