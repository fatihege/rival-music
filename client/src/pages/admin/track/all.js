import axios from 'axios'
import Head from 'next/head'
import {useRouter} from 'next/router'
import Link from '@/components/link'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {DialogueContext} from '@/contexts/dialogue'
import Input from '@/components/form/input'
import {AlbumDefault, DeleteIcon} from '@/icons'
import styles from '@/styles/admin/view-tracks.module.sass'

export default function ViewTracksPage() {
    const LIMIT = 66 // Limit of tracks per request
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get the user state from the auth context
    const [sorting, _setSorting] = useState('last-created') // Sorting state
    const [tracks, _setTracks] = useState([]) // Tracks state
    const [, setAlert] = useContext(AlertContext) // Get the alert state from the alert context
    const [, setDialogue] = useContext(DialogueContext) // Get the dialogue state from the dialogue context
    const [loading, setLoading] = useState(false) // Loading state
    const searchRef = useRef('') // Search ref
    const blockSearchRef = useRef(true) // Block search ref
    const cursorRef = useRef(0) // Cursor state
    const sortingRef = useRef(sorting) // Sorting ref
    const tracksRef = useRef(tracks) // Tracks ref
    /**
     * @type {React.MutableRefObject<HTMLDivElement>}
     */
    const contentRef = useRef()

    const setSorting = value => { // Set sorting state
        sortingRef.current = value
        _setSorting(value)
    }

    const setTracks = value => { // Set tracks state
        tracksRef.current = value
        _setTracks(value)
    }

    const getTracks = async (fromZero = false) => {
        setLoading(true)
        if (fromZero) cursorRef.current = 0 // If fromZero is true, set cursor to 0

        try {
            const response = await axios.get(`${process.env.API_URL}/track?cursor=${cursorRef.current}&limit=${LIMIT}&sorting=${sortingRef.current}${searchRef.current?.trim()?.length ? `&query=${searchRef.current?.trim()}` : ''}`) // Get tracks from API

            if (response.data?.status === 'OK' && response.data?.tracks) { // If response is OK
                setTracks(fromZero ? response.data?.tracks : [...tracksRef.current, ...response.data?.tracks]) // Set tracks state
                cursorRef.current += response.data?.tracks?.length || 0 // Increase cursor
            }
        } catch (e) { // If an error occurred
            console.error(e)
            setAlert({ // Set alert state
                active: true,
                title: 'Error occurred while retrieving data.',
                description: 'An error occurred while retrieving data. Please try again later.',
                button: 'OK',
                type: '',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { // On user state change
        if (user?.loaded && !user?.admin) router.push('/404') // If the user is not an admin, redirect to 404 page
        if (user?.loaded && user?.id && user?.token && user?.admin) getTracks() // If the user is an admin, get tracks from API
    }, [user])

    useEffect(() => { // On sorting state change
        if (user?.loaded && user?.token && user?.id && user?.admin) getTracks(true) // If the user is an admin, get tracks from API
    }, [sorting])

    useEffect(() => {
        if (!contentRef.current) return // If contentRef is not defined, return

        const handleScroll = () => { // Add scroll event listener
            if (contentRef.current.scrollTop + contentRef.current.clientHeight >= contentRef.current.scrollHeight) getTracks() // If the user scrolled to the bottom of the page, get tracks from API
        }

        contentRef.current.addEventListener('scroll', handleScroll)

        return () => { // Remove scroll event listener
            if (contentRef.current) contentRef.current.removeEventListener('scroll', handleScroll)
        }
    }, [contentRef.current])

    const handleSearch = () => {
        if (user?.loaded && user?.token && user?.id && user?.admin) getTracks(true)  // If the user is an admin, get tracks from API
    }

    const showDeleteDialogue = (e, trackId) => {
        e.preventDefault() // Prevent default event
        e.stopPropagation() // Stop event propagation

        setDialogue({
            active: true,
            title: 'Delete Track',
            description: 'Are you sure you want to delete this track?',
            button: 'Delete Track',
            type: 'danger',
            callback: () => { // On dialogue button click
                try {
                    axios.delete(`${process.env.API_URL}/admin/${user.token}/track/${trackId}`, { // Delete track from API
                        headers: {
                            Authorization: `Bearer ${user?.token}`,
                        },
                    })
                    setTracks(tracksRef.current.filter(a => a?._id !== trackId)) // Remove track from tracks state
                } catch (e) { // If an error occurred
                    console.error(e) // Log error to console
                    setAlert({ // Set alert state
                        active: true,
                        title: 'Error occurred while deleting track.',
                        description: 'An error occurred while deleting track. Please try again later.',
                        button: 'OK',
                        type: '',
                    })
                }
            }
        })
    }

    return user?.loaded && user?.id && user?.token && user?.admin && (
        <>
            <Head>
                <title>Tracks — Rival Music</title>
            </Head>
            <div className={styles.mainContainer} ref={contentRef}>
                <h1 className={styles.mainTitle}>Tracks</h1>
                <div className={styles.actions}>
                    <Link href={`/admin/track/create`}>Create Track</Link>
                    <button onClick={() => setSorting('last-created')} className={sorting === 'last-created' ? styles.active : ''}>Last created</button>
                    <button onClick={() => setSorting('first-created')} className={sorting === 'first-created' ? styles.active : ''}>First created</button>
                    <button onClick={() => setSorting('last-released')} className={sorting === 'last-released' ? styles.active : ''}>Last released</button>
                    <button onClick={() => setSorting('first-released')} className={sorting === 'first-released' ? styles.active : ''}>First released</button>
                    <button onClick={() => setSorting('most-popular')} className={sorting === 'most-popular' ? styles.active : ''}>Most popular</button>
                    <button onClick={() => setSorting('least-popular')} className={sorting === 'least-popular' ? styles.active : ''}>Least popular</button>
                    <button onClick={() => setSorting('most-songs')} className={sorting === 'most-songs' ? styles.active : ''}>Most songs</button>
                    <button onClick={() => setSorting('least-songs')} className={sorting === 'least-songs' ? styles.active : ''}>Least songs</button>
                </div>
                <div className={styles.searchContainer}>
                    <Input placeholder="Search track by title, album, artist, or genre" className={styles.search} onChange={value => {
                        searchRef.current = value
                        if (!blockSearchRef.current) handleSearch()
                        else blockSearchRef.current = false
                    }}/>
                </div>
                <div className={styles.tracksContainer}>
                    <div className={styles.tracks}>
                        {tracks?.map(track => (
                            <Link key={track?._id} className={styles.track} href={`/admin/track/[id]`} as={`/admin/track/${track?._id}`}>
                                <div className={styles.profile}>
                                    {track?.album?.cover ? <img src={`${process.env.IMAGE_CDN}/${track?.album?.cover}`} alt={track?.album?.title}/> : <AlbumDefault/>}
                                </div>
                                <div className={styles.info}>
                                    <h2 className={styles.name}>{track?.title}</h2>
                                    <h4 className={styles.artist}>{track?.album?.artist?.name} - {track?.album?.title}</h4>
                                </div>
                                <div className={styles.operation}>
                                    <button className={styles.deleteButton} onClick={e => showDeleteDialogue(e, track?._id || track?.id)}>
                                        <DeleteIcon stroke={'#1c1c1c'} strokeRate={1.5}/>
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loading}></div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}