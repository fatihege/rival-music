import axios from 'axios'
import Head from 'next/head'
import {useRouter} from 'next/router'
import Link from '@/components/link'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {DialogueContext} from '@/contexts/dialogue'
import {DeleteIcon} from '@/icons'
import styles from '@/styles/admin/view-artists.module.sass'
import Input from '@/components/form/input'

export default function ViewArtistsPage() {
    const LIMIT = 66 // Limit of artists per request
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get the user state from the auth context
    const [sorting, _setSorting] = useState('last-created') // Sorting state
    const [artists, _setArtists] = useState([]) // Artists state
    const [, setAlert] = useContext(AlertContext) // Get the alert state from the alert context
    const [, setDialogue] = useContext(DialogueContext) // Get the dialogue state from the dialogue context
    const [loading, setLoading] = useState(false) // Loading state
    const [search, setSearch] = useState('')
    const cursorRef = useRef(0) // Cursor state
    const sortingRef = useRef(sorting) // Sorting ref
    const artistsRef = useRef(artists) // Artists ref
    const contentRef = useRef()

    const setSorting = value => { // Set sorting state
        sortingRef.current = value
        _setSorting(value)
    }

    const setArtists = value => { // Set artists state
        artistsRef.current = value
        _setArtists(value)
    }

    const getArtists = async (fromZero = false) => {
        setLoading(true)
        if (fromZero) cursorRef.current = 0 // If fromZero is true, set cursor to 0

        try {
            const response = await axios.get(`${process.env.API_URL}/artist${search?.trim()?.length ? `?query=${search.trim()}` : `?cursor=${cursorRef.current}&limit=${LIMIT}&sorting=${sortingRef.current}`}`) // Get artists from API

            if (response.data?.status === 'OK' && response.data?.artists) { // If response is OK
                setArtists(fromZero ? response.data?.artists : [...artistsRef.current, ...response.data?.artists]) // Set artists state
                cursorRef.current += response.data?.artists?.length || 0 // Increase cursor
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
        if (user?.loaded && user?.id && user?.token && user?.admin) getArtists() // If the user is an admin, get artists from API
    }, [user])

    useEffect(() => { // On sorting state change
        if (user?.loaded && user?.token && user?.id && user?.admin) getArtists(true) // If the user is an admin, get artists from API
    }, [sorting])

    useEffect(() => { // On search state change
        if (user?.loaded && user?.token && user?.id && user?.admin) getArtists(true) // If the user is an admin, get artists from API
    }, [search])

    useEffect(() => {
        if (!contentRef.current) return // If contentRef is not defined, return

        const handleScroll = () => { // Add scroll event listener
            if (search?.trim()?.length) return // If there is a search query, return
            if (contentRef.current.scrollTop + contentRef.current.clientHeight >= contentRef.current.scrollHeight) getArtists() // If the user scrolled to the bottom of the page, get artists from API
        }

        contentRef.current.addEventListener('scroll', handleScroll)

        return () => { // Remove scroll event listener
            if (contentRef.current) contentRef.current.removeEventListener('scroll', handleScroll)
        }
    }, [contentRef.current])

    const showDeleteDialogue = (e, artistId) => {
        e.preventDefault() // Prevent default event
        e.stopPropagation() // Stop event propagation

        setDialogue({
            active: true,
            title: 'Delete Artist',
            description: 'Are you sure you want to delete this artist?',
            button: 'Delete Artist',
            type: 'danger',
            callback: () => { // On dialogue button click
                try {
                    axios.delete(`${process.env.API_URL}/admin/artist/${artistId}`, { // Delete artist from API
                        headers: {
                            Authorization: `Bearer ${user?.token}`,
                        },
                    })
                    setArtists(artistsRef.current.filter(a => a?._id !== artistId)) // Remove artist from artists state
                } catch (e) { // If an error occurred
                    console.error(e) // Log error to console
                    setAlert({ // Set alert state
                        active: true,
                        title: 'Error occurred while deleting artist.',
                        description: 'An error occurred while deleting artist. Please try again later.',
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
                <title>Artists — Rival Music</title>
            </Head>
            <div className={styles.mainContainer} ref={contentRef}>
                <h1 className={styles.mainTitle}>Artists</h1>
                <div className={styles.actions}>
                    <Link href={`/admin/artist/create`}>Create Artist</Link>
                    <button onClick={() => setSorting('last-created')} className={sorting === 'last-created' ? styles.active : ''}>Last created</button>
                    <button onClick={() => setSorting('first-created')} className={sorting === 'first-created' ? styles.active : ''}>First created</button>
                    <button onClick={() => setSorting('last-debuted')} className={sorting === 'last-debuted' ? styles.active : ''}>Last debuted</button>
                    <button onClick={() => setSorting('first-debuted')} className={sorting === 'first-debuted' ? styles.active : ''}>First debuted</button>
                </div>
                <div className={styles.searchContainer}>
                    <Input placeholder="Search artist by name, description, or genre" className={styles.search} onChange={value => setSearch(value)}/>
                </div>
                <div className={styles.artistsContainer}>
                    <div className={styles.artists}>
                        {artists?.map(artist => (
                            <Link key={artist?._id} className={styles.artist} href={`/admin/artist/[id]`} as={`/admin/artist/${artist?._id}`}>
                                <div className={styles.profile}>
                                    {artist?.image ? <img src={`${process.env.IMAGE_CDN}/${artist?.image}`} alt={artist?.name}/> : artist?.name?.slice(0, 1)?.toUpperCase()}
                                </div>
                                <div className={styles.info}>
                                    <h2 className={styles.name}>{artist?.name}</h2>
                                    {artist?.description?.length && <p className={styles.description}>{artist?.description?.slice(0, 100)?.trim()}...</p>}
                                </div>
                                <div className={styles.operation}>
                                    <button className={styles.deleteButton} onClick={e => showDeleteDialogue(e, artist?._id || artist?.id)}>
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