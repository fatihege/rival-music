import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useState} from 'react'
import axios from 'axios'
import Skeleton from 'react-loading-skeleton'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import Link from '@/components/custom-link'
import styles from '@/styles/admin/admin.module.sass'
import 'react-loading-skeleton/dist/skeleton.css'

export default function AdminPage() {
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get user data from auth context
    const [, setAlert] = useContext(AlertContext) // Use alert context to show alerts
    const [statistics, setStatistics] = useState({ // Statistics state
        loaded: false,
        users: 0,
        artists: 0,
        albums: 0,
        tracks: 0,
        playlists: 0,
    })

    const getStatistics = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/admin/${user.token}/statistics`) // Get statistics from API

            if (response.data?.status === 'OK' && response.data?.data) { // If response is OK
                setStatistics({ // Set statistics state
                    ...response.data.data,
                    loaded: true,
                })
            }
        } catch (e) { // If an error occurred
            setAlert({ // Show alert
                active: true,
                title: 'Cannot get statistics',
                message: 'An error occurred while retrieving app statistics.',
                button: 'OK',
                type: '',
            })
            setStatistics({ // Set loaded to true to show skeleton
                ...statistics,
                loaded: true,
            })
            console.error(e)
        }
    }

    useEffect(() => {
        if (!user.loaded) return // If user is not loaded, return
        if (!user?.token || !user?.admin) { // If user is not logged in or is not an admin
            router.push('/404') // Redirect to 404 page
            return // Return
        }

        getStatistics() // Get statistics from API
    }, [user])

    return user.loaded && user?.admin ? (
        <>
            <Head>
                <title>Administration Panel — Rival Music</title>
            </Head>
            <div className={`${styles.mainContainer} ${styles.adminContainer}`}>
                <h1 className={styles.mainTitle}>Administration Panel</h1>
                <div className={styles.statistics}>
                    <div className={styles.stat}>
                        <span>Users</span>
                        <span className={`${styles.data} ${statistics.loaded ? styles.loaded : ''}`}>
                            {statistics.loaded ? statistics.users : <Skeleton height={22} baseColor={'rgba(194,194,194,.5)'} highlightColor={'rgba(224,224,224,.7)'}/>}
                        </span>
                    </div>
                    <div className={styles.stat}>
                        <span>Artists</span>
                        <span className={`${styles.data} ${statistics.loaded ? styles.loaded : ''}`}>
                            {statistics.loaded ? statistics.artists : <Skeleton height={22} baseColor={'rgba(194,194,194,.5)'} highlightColor={'rgba(224,224,224,.7)'}/>}
                        </span>
                    </div>
                    <div className={styles.stat}>
                        <span>Albums</span>
                        <span className={`${styles.data} ${statistics.loaded ? styles.loaded : ''}`}>
                            {statistics.loaded ? statistics.albums : <Skeleton height={22} baseColor={'rgba(194,194,194,.5)'} highlightColor={'rgba(224,224,224,.7)'}/>}
                        </span>
                    </div>
                    <div className={styles.stat}>
                        <span>Tracks</span>
                        <span className={`${styles.data} ${statistics.loaded ? styles.loaded : ''}`}>
                            {statistics.loaded ? statistics.tracks : <Skeleton height={22} baseColor={'rgba(194,194,194,.5)'} highlightColor={'rgba(224,224,224,.7)'}/>}
                        </span>
                    </div>
                    <div className={styles.stat}>
                        <span>Playlists</span>
                        <span className={`${styles.data} ${statistics.loaded ? styles.loaded : ''}`}>
                            {statistics.loaded ? statistics.playlists : <Skeleton height={22} baseColor={'rgba(194,194,194,.5)'} highlightColor={'rgba(224,224,224,.7)'}/>}
                        </span>
                    </div>
                </div>
                <div className={styles.adminLinks}>
                    <Link href={'/admin/create-artist'} className={styles.link}>Create Artist</Link>
                </div>
            </div>
        </>
    ) : <></>
}