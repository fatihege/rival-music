import {useRouter} from 'next/router'
import Head from 'next/head'
import Link from '@/components/link'
import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {DialogueContext} from '@/contexts/dialogue'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import formatTime from '@/utils/format-time'
import {AddIcon, CloseIcon, DiscIcon, NextIcon} from '@/icons'
import styles from '@/styles/admin/create-album.module.sass'

// Overlay component
const Overlay = ({handler}) => (
    <div className={styles.overlay} onClick={handler}>
        <div className={styles.icon}>
            <AddIcon/>
        </div>
        Upload Photo
    </div>
)

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

export default function EditAlbumPage({id}) {
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get the user state from the auth context
    const [, setAlert] = useContext(AlertContext) // Get the alert state from the alert context
    const [, setDialogue] = useContext(DialogueContext) // Get the dialogue state from the dialogue context
    const [album, setAlbum] = useState({ // Album state
        id: null,
        cover: null,
        title: '',
        releaseYear: '',
        artist: null,
        genres: [''],
        discs: [],
    })
    const [artist, setArtist] = useState(null) // Artist state
    const [artistQuery, setArtistQuery] = useState('') // Artist query state
    const [artistsResult, setArtistsResult] = useState([]) // Artists result state
    const [releaseYearAlert, setReleaseYearAlert] = useState(null) // Release year alert state
    const [cover, setCover] = useState(null) // Cover state
    const [coverImage, setCoverImage] = useState(null) // Cover image state
    const coverRef = useRef() // Cover input reference
    const [disableSubmit, setDisableSubmit] = useState(false) // Is submit button disabled

    useEffect(() => {
        if (!album?.title?.trim()?.length || !album?.releaseYear?.trim()?.length || !album?.artist) // If any of the inputs are empty
            setDisableSubmit(true) // Disable submit button
        else setDisableSubmit(false) // Otherwise, enable submit button
    }, [album])

    useEffect(() => {
        if (user?.loaded && !user?.admin) router.push('/404') // If the user is not an admin, redirect to 404 page
        if (user?.loaded && user?.admin) getAlbumData() // If the user is an admin, get album data
    }, [user])

    const getAlbumData = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/album/${id}?tracks=1`) // Get album data from API

            if (response.data?.status === 'OK' && response.data?.album) { // If response is OK
                const {_id, cover, title, releaseYear, artist, genres} = response.data.album // Get album data
                setAlbum({ // Set album state
                    id: _id,
                    cover,
                    title,
                    releaseYear: releaseYear.toString(),
                    artist: artist?._id || artist?.id,
                    genres,
                    discs: response.data.album?.discs,
                })
                setArtist(artist) // Set artist state
            }
        } catch (e) { // If an error occurred
            setAlert({ // Show alert
                active: true,
                title: 'Cannot get album data',
                message: 'An error occurred while retrieving album data.',
                button: 'OK',
                type: '',
            })
            console.error(e)
        }
    }

    const handleCoverSelect = e => {
        const file = e.target.files[0] // Get the file
        if (!file) return // If there is no file, return

        // Otherwise,
        setCover(file) // Update the cover state
        setCoverImage(URL.createObjectURL(file)) // Create an object URL for the cover image and set the cover image state
    }

    const handleAddGenre = () => {
        setAlbum({
            ...album,
            genres: [
                ...album.genres, // Add an empty string to the genres array
                '',
            ],
        })
    }

    const updateGenre = (value, index) => {
        setAlbum({
            ...album,
            genres: [ // Update the genres array
                ...album.genres.slice(0, index), // Get the genres before the updated genre
                value, // Update the genre
                ...album.genres.slice(index + 1), // Get the genres after the updated genre
            ],
        })
    }

    const checkReleaseYear = () => {
        const year = parseInt(album.releaseYear) // Parse the release year to int
        if (year >= 1900 && year <= new Date().getFullYear()) // If the year is between 1900 and the current year
        {
            setReleaseYearAlert(null) // Remove the alert
            return true // Return true
        } else {
            setReleaseYearAlert('Invalid release year. The year must be a number between 1900 and the current year.') // Set the alert
            return false // Otherwise, return false
        }
    }

    const getArtists = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/artist?query=${artistQuery.trim()}&limit=50`) // Get artists from API

            if (response.data?.status === 'OK' && response.data?.artists) { // If response is OK
                setArtistsResult(response.data.artists) // Set artists state
            }
        } catch (e) { // If an error occurred
            setAlert({ // Show alert
                active: true,
                title: 'Cannot get artists',
                message: 'An error occurred while retrieving artists.',
                button: 'OK',
                type: '',
            })
            setArtistsResult([])
            console.error(e)
        }
    }

    const handleSubmit = async () => {
        if (!album.title?.trim().length && !album.releaseYear?.trim().length || !checkReleaseYear() || !album.artist) return // If any of the inputs are empty, return

        try {
            const formData = new FormData() // Initialize a form data

            if (coverImage) formData.append('cover', cover) // If cover is not empty, add an entry to the form data
            if (!album.cover && !cover) formData.append('noCover', 'true') // If there is no cover and the cover is not updated, add an entry to the form data
            formData.append('title', album.title) // Add album title entry to the form data
            formData.append('releaseYear', album.releaseYear) // Add album release year entry to the form data
            formData.append('artist', album.artist) // Add album artist entry to the form data
            formData.append('genres', album.genres.toString()) // Add album genres as an entry to the form data

            const response = await axios.post(`${process.env.API_URL}/admin/${user.token}/album/update/${album.id}`, formData, { // Send POST request to the API and get response
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (response.data.status === 'OK' && response.data.id) // If response status is OK
                return router.push('/album/[id]', `/album/${response.data.id}`) // Open album page
        } catch (e) { // If there is an error
            setAlert({ // Show an alert
                active: true,
                title: 'Something went wrong',
                description: 'An error occurred while creating the album.',
                button: 'OK',
                type: '',
            })
            console.error(e)
        }
    }

    const handleDeleteAlbum = () => {
        setDialogue({
            active: true,
            title: 'Delete Album',
            description: 'Are you sure you want to delete this album?',
            button: 'Delete Album',
            type: 'danger',
            callback: async () => {
                try {
                    await axios.delete(`${process.env.API_URL}/admin/${user.token}/album/${album?.id}`, {
                        headers: {
                            Authorization: `Bearer ${user?.token}`,
                        },
                    })
                    router.push('/admin/album/all')
                } catch (e) {
                    console.error(e)
                    setAlert({
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

    useEffect(() => {
        if (!album.releaseYear.trim().length) return // If the release year is empty, return
        checkReleaseYear() // Otherwise, check the release year
    }, [album.releaseYear])

    useEffect(() => {
        if (artistQuery.trim().length) getArtists() // If the artist query is not empty, get artists
        else setArtistsResult([])
    }, [artistQuery])

    return user.loaded && user?.admin ? (
        <>
            <Head>
                <title>Edit Album{album?.title ? `: ${album?.title?.toString()}` : ''} {process.env.SEPARATOR} {process.env.APP_NAME}</title>
            </Head>
            <div className={styles.mainContainer}>
                <h1 className={styles.mainTitle}>Edit Album</h1>
                <div className={styles.albumPreview}>
                    <span className={styles.recommendation}>Recommended dimensions are 800x800</span>
                    <div className={styles.cover}>
                        {coverImage ? <img src={coverImage} alt={'Album Cover Preview'}/> : album?.cover ?
                            <img src={`${process.env.API_URL}/uploads/${album?.cover}`}
                                 alt={'Album Cover Preview'}/> : ''}
                        <Overlay handler={() => coverRef.current?.click()}/>
                    </div>
                    {album?.cover || coverImage ? <button onClick={() => {
                        setAlbum({
                            ...album,
                            cover: null,
                        })
                        setCover(null)
                        setCoverImage(null)
                        coverRef.current.value = null
                    }} className={styles.removeButton}>Remove cover</button> : ''}
                </div>
                <div className={styles.form}>
                    <Input placeholder="Album title" onChange={title => setAlbum({...album, title})}
                           className={styles.formField} value={album?.title}/>
                    <Input placeholder="Release year" onChange={releaseYear => setAlbum({...album, releaseYear})}
                           className={styles.formField} alert={releaseYearAlert} value={album?.releaseYear}/>
                    <div>
                        <h3 className={styles.formTitle}>Artist</h3>
                        {!album?.artist && !artist ? (
                            <Input placeholder="Search for an artist" onChange={value => setArtistQuery(value)}
                                   className={styles.formField} value={artistQuery}/>
                        ) : ''}
                        {!album?.artist && !artist && artistsResult?.length ? (
                            <div className={styles.artistsResult}>
                                {artistsResult?.map((artist, i) => {
                                    return (
                                        <Link href={'#'} key={i} className={styles.artist} onClick={e => {
                                            e.preventDefault()
                                            setAlbum({
                                                ...album,
                                                artist: artist?._id || artist?.id,
                                            })
                                            setArtist(artist)
                                            setArtistQuery('')
                                        }}>
                                            <div className={styles.image}>
                                                {artist?.image ?
                                                    <img src={`${process.env.IMAGE_CDN}/${artist?.image}`}
                                                         alt={artist.name}/> :
                                                    artist?.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div className={styles.name}>{artist.name}</div>
                                        </Link>
                                    )
                                })}
                            </div>
                        ) : ''}
                        {artist && artist?.name ? (
                            <div className={styles.artist}>
                                <div className={styles.image}>
                                    {artist?.image ?
                                        <img src={`${process.env.IMAGE_CDN}/${artist?.image}`} alt={artist.name}/> :
                                        artist?.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className={styles.name}>{artist.name}</div>
                                <button className={styles.remove} onClick={() => {
                                    setAlbum({
                                        ...album,
                                        artist: null,
                                    })
                                    setArtist(null)
                                }}>
                                    <CloseIcon stroke={'#eee'} strokeRate={1.25}/>
                                </button>
                            </div>
                        ) : ''}
                    </div>
                    <h3 className={styles.formTitle}>Genres</h3>
                    {album?.genres.map((genre, i) => {
                        return <Input key={i} placeholder={`Genre ${i + 1}`} className={styles.formField}
                                      onChange={value => updateGenre(value, i)} value={album?.genres[i]}/>
                    })}
                    <Button value="Add genre" type="" className={styles.formField} icon={<AddIcon stroke={'#1c1c1c'}/>}
                            onClick={() => handleAddGenre()}/>
                    <Button value="Update album" className={`${styles.formField} ${styles.submitButton}`}
                            icon={<NextIcon stroke={'#1c1c1c'}/>} disabled={disableSubmit}
                            onClick={() => handleSubmit()}/>
                    <Button value="Delete album" type="danger" className={styles.formField}
                            onClick={() => handleDeleteAlbum()}/>
                    <input type="file" ref={coverRef} className="hide" onChange={handleCoverSelect}
                           accept=".png,.jpg,.jpeg"/>
                    <div className={styles.tracks}>
                        <h3 className={styles.formTitle}>Tracks</h3>
                        <Link href={`/admin/track/create#${album?.id || album?._id}`} className={styles.addLink}>
                            Add Track
                        </Link>
                        {album?.discs?.map((disc, i) => (
                            <div className={styles.disc} key={i}>
                                {album?.discs?.length > 1 ? (
                                    <div className={styles.discTitle}>
                                        <DiscIcon stroke={'#eee'}/>
                                        Disc {i + 1}
                                    </div>
                                ) : ''}
                                {disc?.length ? disc.map((t, j) => (
                                    <Link href={'/admin/track/[id]'} as={`/admin/track/${t._id}`} key={j}
                                          className={styles.track}>
                                        <div className={styles.trackInfo}>
                                            <div className={styles.trackNumber}>{j + 1}</div>
                                            <div className={styles.trackTitle}>{t?.title}</div>
                                        </div>
                                        <div className={styles.trackDuration}>{formatTime(t?.duration)}</div>
                                    </Link>
                                )) : <div className={styles.noTracks}>No tracks found.</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    ) : <></>
}