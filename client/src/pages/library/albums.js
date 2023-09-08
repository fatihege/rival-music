import axios from 'axios'
import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import Link from '@/components/link'
import {AuthContext} from '@/contexts/auth'
import Slider from '@/components/slider'
import styles from '@/styles/library.module.sass'

export default function LibraryAlbumPage() {
    const router = useRouter() // Create Next router instance
    const [user] = useContext(AuthContext) // Get user from AuthContext
    const [albums, setAlbums] = useState([]) // Create liked albums state
    const [loading, setLoading] = useState(false) // Create loading state
    const containerRef = useRef(null) // Create container reference
    const finishedRef = useRef(false) // Create finished reference
    const cursorRef = useRef(0) // Create cursor reference
    const limit = 18 // Set limit for liked albums

    const getAlbums = async () => {
        if (!user?.id || finishedRef.current) return // If user is not logged in or there are no more liked albums, don't do anything
        setLoading(true) // Set loading state to true
        const response = await axios.get(`${process.env.API_URL}/album/user/${user.id}?limit=${limit}&cursor=${cursorRef.current}`) // Get user's liked albums
        cursorRef.current += limit // Increase cursor
        if (response.data.status === 'OK') {
            if (response.data.albums.length < limit) finishedRef.current = true // If there are less liked albums than limit, set finished state to true
            setAlbums(prev => [...prev, ...(response.data?.albums || [])]) // Set liked albums state
        }
        setLoading(false) // Set loading state to false
    }

    useEffect(() => {
        if (user?.loaded && (!user?.id || !user?.token)) {
            router.push('/')
            return
        }

        getAlbums() // Get user's liked albums
    }, [user])

    useEffect(() => {
        if (!containerRef.current) return // If container element is not loaded, don't do anything
        const container = containerRef.current // Get container element

        const handleScroll = () => {
            if (!finishedRef.current && container.scrollHeight - container.scrollTop === container.clientHeight) getAlbums()
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
                <title>Albums — Rival Music</title>
            </Head>
            <div className={styles.container} ref={containerRef}>
                <h1 className={styles.pageTitle}>Saved albums</h1>
                <div className={styles.topSection}>
                    <Link href={'/library/playlists'}>
                        Playlists
                    </Link>
                    <Link href={'/library/tracks'}>
                        Favourite tracks
                    </Link>
                </div>
                <Slider type={'album'} title="Your favourite albums" items={albums} scrollable={false}/>
                {loading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loading}></div>
                    </div>
                )}
            </div>
        </>
    ) : ''
}