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
import styles from '@/styles/admin/view-albums.module.sass'

export default function ViewAlbumsPage() {
    const LIMIT = 66 // Limit of albums per request
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get the user state from the auth context
    const [sorting, _setSorting] = useState('last-created') // Sorting state
    const [albums, _setAlbums] = useState([]) // Albums state
    const [, setAlert] = useContext(AlertContext) // Get the alert state from the alert context
    const [, setDialogue] = useContext(DialogueContext) // Get the dialogue state from the dialogue context
    const [loading, setLoading] = useState(false) // Loading state
    const [search, setSearch] = useState('')
    const cursorRef = useRef(0) // Cursor state
    const sortingRef = useRef(sorting) // Sorting ref
    const albumsRef = useRef(albums) // Albums ref
    const contentRef = useRef()
    const searchTimeoutRef = useRef()

    const setSorting = value => { // Set sorting state
        sortingRef.current = value
        _setSorting(value)
    }

    const setAlbums = value => { // Set albums state
        albumsRef.current = value
        _setAlbums(value)
    }

    const getAlbums = async (fromZero = false) => {
        setLoading(true)
        if (fromZero) cursorRef.current = 0 // If fromZero is true, set cursor to 0

        try {
            const response = await axios.get(`${process.env.API_URL}/album${search?.trim()?.length ? `?query=${search?.trim()}` : `?cursor=${cursorRef.current}&limit=${LIMIT}&sorting=${sortingRef.current}`}`) // Get albums from API

            if (response.data?.status === 'OK' && response.data?.albums) { // If response is OK
                setAlbums(fromZero ? response.data?.albums : [...albumsRef.current, ...response.data?.albums]) // Set albums state
                cursorRef.current += response.data?.albums?.length || 0 // Increase cursor
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
        if (user?.loaded && user?.id && user?.token && user?.admin) getAlbums() // If the user is an admin, get albums from API
    }, [user])

    useEffect(() => { // On sorting state change
        if (user?.loaded && user?.token && user?.id && user?.admin) getAlbums(true) // If the user is an admin, get albums from API
    }, [sorting])

    useEffect(() => { // On search state change
        if (user?.loaded && user?.token && user?.id && user?.admin) getAlbums(true) // If the user is an admin, get albums from API
    }, [search])

    useEffect(() => {
        if (!contentRef.current) return // If contentRef is not defined, return

        const handleScroll = () => { // Add scroll event listener
            if (search?.trim()?.length) return // If there is a search query, return
            if (contentRef.current.scrollTop + contentRef.current.clientHeight >= contentRef.current.scrollHeight) getAlbums() // If the user scrolled to the bottom of the page, get albums from API
        }

        contentRef.current.addEventListener('scroll', handleScroll)

        return () => { // Remove scroll event listener
            if (contentRef.current) contentRef.current.removeEventListener('scroll', handleScroll)
        }
    }, [contentRef.current])

    const showDeleteDialogue = (e, albumId) => {
        e.preventDefault() // Prevent default event
        e.stopPropagation() // Stop event propagation

        setDialogue({
            active: true,
            title: 'Delete Album',
            description: 'Are you sure you want to delete this album?',
            button: 'Delete Album',
            type: 'danger',
            callback: () => { // On dialogue button click
                try {
                    axios.delete(`${process.env.API_URL}/admin/${user.token}/album/${albumId}`, { // Delete album from API
                        headers: {
                            Authorization: `Bearer ${user?.token}`,
                        },
                    })
                    setAlbums(albumsRef.current.filter(a => a?._id !== albumId)) // Remove album from albums state
                } catch (e) { // If an error occurred
                    console.error(e) // Log error to console
                    setAlert({ // Set alert state
                        active: true,
                        title: 'Error occurred while deleting album.',
                        description: 'An error occurred while deleting album. Please try again later.',
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
                <title>Albums {process.env.SEPARATOR} {process.env.APP_NAME}</title>
            </Head>
            <div className={styles.mainContainer} ref={contentRef}>
                <h1 className={styles.mainTitle}>Albums</h1>
                <div className={styles.actions}>
                    <Link href={`/admin/album/create`}>Create Album</Link>
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
                    <Input placeholder="Search album by title or artist" className={styles.search} onChange={value => {
                        clearTimeout(searchTimeoutRef.current)
                        searchTimeoutRef.current = setTimeout(() => setSearch(value), 500)
                    }}/>
                </div>
                <div className={styles.albumsContainer}>
                    <div className={styles.albums}>
                        {albums?.map(album => (
                            <Link key={album?._id} className={styles.album} href={`/admin/album/[id]`} as={`/admin/album/${album?._id}`}>
                                <div className={styles.profile}>
                                    {album?.cover ? <img src={`${process.env.IMAGE_CDN}/${album?.cover}`} alt={album?.title}/> : <AlbumDefault/>}
                                </div>
                                <div className={styles.info}>
                                    <h2 className={styles.name}>{album?.title}</h2>
                                    <h4 className={styles.artist}>{album?.artist?.name}</h4>
                                </div>
                                <div className={styles.operation}>
                                    <button className={styles.deleteButton} onClick={e => showDeleteDialogue(e, album?._id || album?.id)}>
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