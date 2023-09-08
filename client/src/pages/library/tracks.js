import axios from 'axios'
import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import Link from '@/components/link'
import {AuthContext} from '@/contexts/auth'
import Slider from '@/components/slider'
import styles from '@/styles/library.module.sass'
import Tracks from '@/components/tracks'

export default function LibraryAlbumPage() {
    const router = useRouter() // Create Next router instance
    const [user] = useContext(AuthContext) // Get user from AuthContext
    const [tracks, setTracks] = useState([]) // Create liked tracks state
    const [loading, setLoading] = useState(false) // Create loading state
    const containerRef = useRef(null) // Create container reference
    const finishedRef = useRef(false) // Create finished reference
    const cursorRef = useRef(0) // Create cursor reference
    const limit = 30 // Set limit for liked tracks

    const getTracks = async () => {
        if (!user?.id || finishedRef.current) return // If user is not logged in or there are no more liked tracks, don't do anything
        setLoading(true) // Set loading state to true
        const response = await axios.get(`${process.env.API_URL}/track/user/${user.id}?limit=${limit}&cursor=${cursorRef.current}`) // Get user's liked tracks
        cursorRef.current += limit // Increase cursor
        if (response.data.status === 'OK') {
            if (response.data.tracks.length < limit) finishedRef.current = true // If there are less liked tracks than limit, set finished state to true
            setTracks(prev => [...prev, ...(response.data?.tracks || [])]) // Set liked tracks state
        }
        setLoading(false) // Set loading state to false
    }

    useEffect(() => {
        if (user?.loaded && (!user?.id || !user?.token)) {
            router.push('/')
            return
        }

        getTracks() // Get user's liked tracks
    }, [user])

    useEffect(() => {
        if (!containerRef.current) return // If container element is not loaded, don't do anything
        const container = containerRef.current // Get container element

        const handleScroll = () => {
            if (!finishedRef.current && container.scrollHeight - container.scrollTop === container.clientHeight) getTracks()
        }

        container.addEventListener('scroll', handleScroll) // Add scroll event listener to container element
        container.addEventListener('wheel', handleScroll) // Add scroll event listener to container element

        return () => {
            container.removeEventListener('scroll', handleScroll) // Remove scroll event listener from container element
            container.removeEventListener('wheel', handleScroll) // Remove scroll event listener from container element
        }
    }, [containerRef.current])

    return user?.loaded && user?.id && user?.token ? (
        <>
            <Head>
                <title>Tracks — Rival Music</title>
            </Head>
            <div className={styles.container} ref={containerRef}>
                <h1 className={styles.pageTitle}>Your favourite tracks</h1>
                <div className={styles.topSection}>
                    <Link href={'/library/playlists'}>
                        Playlists
                    </Link>
                    <Link href={'/library/albums'}>
                        Favourite albums
                    </Link>
                </div>
                <Tracks items={[tracks, tracks, tracks, setTracks]} noPadding={true}/>
                {loading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loading}></div>
                    </div>
                )}
            </div>
        </>
    ) : ''
}