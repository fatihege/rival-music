import {useRouter} from 'next/router'
import Head from 'next/head'
import Link from '@/components/link'
import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import {AddIcon, CloseIcon, NextIcon} from '@/icons'
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

export default function CreateAlbumPage() {
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get the user state from the auth context
    const [, setAlert] = useContext(AlertContext) // Get the alert state from the alert context
    const [album, setAlbum] = useState({ // Album state
        title: '',
        releaseYear: '',
        artist: null,
        genres: [''],
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
        if (user.loaded && !user?.admin) router.push('/404') // If the user is not an admin, redirect to 404 page
    }, [user])

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
        if (year >= 1900 && year <= new Date().getFullYear()) { // If the year is between 1900 and the current year
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

        setDisableSubmit(true)

        try {
            const formData = new FormData() // Initialize a form data

            if (cover) formData.append('cover', cover) // If cover is not empty, add an entry to the form data
            formData.append('title', album.title) // Add album title entry to the form data
            formData.append('releaseYear', album.releaseYear) // Add album release year entry to the form data
            formData.append('artist', album.artist) // Add album artist entry to the form data
            formData.append('genres', album.genres.toString()) // Add album genres as an entry to the form data

            const response = await axios.post(`${process.env.API_URL}/admin/album/create`, formData, { // Send POST request to the API and get response
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
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
        } finally {
            setDisableSubmit(false)
        }
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
                <title>Create Album — Rival Music</title>
            </Head>
            <div className={styles.mainContainer}>
                <h1 className={styles.mainTitle}>Create Album</h1>
                <div className={styles.albumPreview}>
                    <span className={styles.recommendation}>Recommended dimensions are 800x800</span>
                    <div className={styles.cover}>
                        {coverImage ? <img src={coverImage} alt={'Album Cover Preview'}/> : ''}
                        <Overlay handler={() => coverRef.current?.click()}/>
                    </div>
                    {coverImage ? <button onClick={() => {
                        setCover(null)
                        setCoverImage(null)
                        coverRef.current.value = null
                    }} className={styles.removeButton}>Remove cover</button> : ''}
                </div>
                <div className={styles.form}>
                    <Input placeholder="Album title" onChange={title => setAlbum({...album, title})}
                           className={styles.formField}/>
                    <Input placeholder="Release year" onChange={releaseYear => setAlbum({...album, releaseYear})}
                           className={styles.formField} alert={releaseYearAlert}/>
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
                    {album.genres.map((genre, i) => {
                        return <Input key={i} placeholder={`Genre ${i + 1}`} className={styles.formField}
                                      onChange={value => updateGenre(value, i)}/>
                    })}
                    <Button value="Add genre" type="" className={styles.formField} icon={<AddIcon stroke={'#1c1c1c'}/>}
                            onClick={() => handleAddGenre()}/>
                    <Button value="Create album" className={`${styles.formField} ${styles.submitButton}`}
                            icon={<NextIcon stroke={'#1c1c1c'}/>} disabled={disableSubmit}
                            onClick={() => handleSubmit()}/>
                    <input type="file" ref={coverRef} className="hide" onChange={handleCoverSelect}
                           accept=".png,.jpg,.jpeg"/>
                </div>
            </div>
        </>
    ) : <></>
}