import {useRouter} from 'next/router'
import Head from 'next/head'
import Link from '@/components/link'
import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import {AddIcon, AlbumDefault, CloseIcon, EditIcon, NextIcon} from '@/icons'
import styles from '@/styles/admin/create-track.module.sass'

export default function CreateTrackPage() {
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get the user state from the auth context
    const [, setAlert] = useContext(AlertContext) // Get the alert state from the alert context
    const [track, setTrack] = useState({ // Track state
        title: '',
        album: null,
        duration: 0,
        order: 0,
        genres: [''],
        lyrics: [],
    })
    const [editLyric, setEditLyric] = useState(null) // Edit lyric state
    const [lyric, setLyric] = useState({ // Lyric start state
        minute: 0,
        second: 0,
        millisecond: 0,
        text: '',
    })
    const [album, setAlbum] = useState(null) // Album state
    const [albumQuery, setAlbumQuery] = useState('') // Album query state
    const [albumsResult, setAlbumsResult] = useState([]) // Albums result state
    const [audio, setAudio] = useState(null) // Audio state
    const [audioFile, setAudioFile] = useState(null) // Audio file state
    const audioRef = useRef(null) // Audio reference
    const audioElement = useRef(null) // Audio element reference
    const [disableSubmit, setDisableSubmit] = useState(false) // Is submit button disabled

    useEffect(() => {
        if (!track?.title?.trim()?.length || !track?.album) // If any of the inputs are empty file is not selected
            setDisableSubmit(true) // Disable submit button
        else setDisableSubmit(false) // Otherwise, enable submit button
    }, [track, audioFile])

    useEffect(() => {
        if (user.loaded && !user?.admin) router.push('/404') // If the user is not an admin, redirect to 404 page
    }, [user])

    const handleAudioFile = e => {
        if (!e.target?.files?.length) return // If there is no file, return
        setAudioFile(e.target.files[0])
        setAudio(URL.createObjectURL(e.target.files[0]))
    }

    const handleAddGenre = () => {
        setTrack({
            ...track,
            genres: [
                ...track.genres, // Add an empty string to the genres array
                '',
            ],
        })
    }

    const updateGenre = (value, index) => {
        setTrack({
            ...track,
            genres: [ // Update the genres array
                ...track.genres.slice(0, index), // Get the genres before the updated genre
                value, // Update the genre
                ...track.genres.slice(index + 1), // Get the genres after the updated genre
            ],
        })
    }

    const getAlbums = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/album?query=${albumQuery.trim()}&limit=50`) // Get albums from API

            if (response.data?.status === 'OK' && response.data?.albums) { // If response is OK
                setAlbumsResult(response.data.albums) // Set albums state
            }
        } catch (e) { // If an error occurred
            setAlert({ // Show alert
                active: true,
                title: 'Cannot get albums',
                message: 'An error occurred while retrieving albums.',
                button: 'OK',
                type: '',
            })
            setAlbumsResult([])
            console.error(e)
        }
    }

    const handleSubmit = async () => {
        if (!track.title?.trim().length || !track.album) return // If title or album is empty, return

        setDisableSubmit(true)

        try {
            const formData = new FormData() // Create a new form data instance

            if (audioFile) formData.append('audio', audioFile) // Append the audio file to the form data
            formData.append('title', track.title?.trim()) // Append the track title to the form data
            formData.append('album', track.album) // Append the album ID to the form data
            formData.append('duration', track.duration) // Append the duration to the form data
            formData.append('order', track.order) // Append the order to the form data
            formData.append('genres', track.genres.toString()) // Append the genres to the form data
            formData.append('lyrics', JSON.stringify(track.lyrics)) // Append the lyrics to the form data

            const response = await axios.post(`${process.env.API_URL}/admin/${user.token}/track/create`, formData, { // Send a POST request to the API
                headers: {
                    'Content-Type': 'multipart/form-data', // Set the content type to multipart/form-data
                }
            })

            if (response.data.status === 'OK' && response.data.id) // If response status is OK
                return router.push('/album/[id]', `/album/${response.data.album}#${response.data.id}`) // Open album page with the new track
        } catch (e) { // If there is an error
            setAlert({ // Show an alert
                active: true,
                title: 'Something went wrong',
                description: 'An error occurred while creating the track.',
                button: 'OK',
                type: '',
            })
            console.error(e)
        } finally {
            setDisableSubmit(false)
        }
    }

    const handleLyricTimeInput = (key, val, e) => {
        if (!key || typeof val !== 'string') return

        if (!isNaN(Number(val)) && !val?.includes('e'))
            setLyric({
                ...lyric,
                [key]: Number(val),
            })
        else {
            e.target.value = parseInt(val.replace('e', '')) || 0
            setLyric({
                ...lyric,
                [key]: Number(e.target.value),
            })
        }
    }

    const handleAddLyric = () => {
        if (!lyric.text?.trim().length) return // If lyric text is empty, return

        if (editLyric !== null) {
            setTrack({
                ...track,
                lyrics: [
                    ...track.lyrics.slice(0, editLyric),
                    {
                        start: `${lyric.minute}:${lyric.second}:${lyric.millisecond}`,
                        text: lyric.text,
                    },
                    ...track.lyrics.slice(editLyric + 1),
                ],
            })
            setEditLyric(null)
            setLyric({
                minute: 0,
                second: 0,
                millisecond: 0,
                text: '',
            })
            return
        }

        setTrack({
            ...track,
            lyrics: [
                ...track.lyrics,
                {
                    start: `${lyric.minute}:${lyric.second}:${lyric.millisecond}`,
                    text: lyric.text,
                },
            ],
        })
        setLyric({
            minute: 0,
            second: 0,
            millisecond: 0,
            text: '',
        })
    }

    useEffect(() => {
        if (albumQuery.trim().length) getAlbums() // If the album query is not empty, get albums
        else setAlbumsResult([])
    }, [albumQuery])

    useEffect(() => {
        if (editLyric !== null) {
            setLyric({
                minute: Number(track.lyrics[editLyric].start.split(':')[0]) || 0,
                second: Number(track.lyrics[editLyric].start.split(':')[1]) || 0,
                millisecond: Number(track.lyrics[editLyric].start.split(':')[2]) || 0,
                text: track.lyrics[editLyric].text,
            })
        }
    }, [editLyric])

    return user.loaded && user?.admin ? (
        <>
            <Head>
                <title>Create Track — Rival Music</title>
            </Head>
            <div className={styles.mainContainer}>
                <h1 className={styles.mainTitle}>Create Track</h1>
                <div className={styles.form}>
                    <h3 className={styles.formTitle}>Title</h3>
                    <Input placeholder="Track title" onChange={title => setTrack({...track, title})}
                           className={styles.formField}/>
                    <div>
                        <h3 className={styles.formTitle}>Album</h3>
                        {!track?.album && !album ? (
                            <Input placeholder="Search for an album" onChange={value => setAlbumQuery(value)}
                                   className={styles.formField} value={albumQuery}/>
                        ) : ''}
                        {!track?.album && !album && albumsResult?.length ? (
                            <div className={styles.albumsResult}>
                                {albumsResult?.map((album, i) => {
                                    return (
                                        <Link href={'#'} key={i} className={styles.album} onClick={e => {
                                            e.preventDefault()
                                            setTrack({
                                                ...track,
                                                album: album?._id || album?.id,
                                            })
                                            setAlbum(album)
                                            setAlbumQuery('')
                                        }}>
                                            <div className={styles.image}>
                                                {album?.cover ?
                                                    <img src={`${process.env.IMAGE_CDN}/${album?.cover}`}
                                                         alt={album?.title}/> :
                                                    <AlbumDefault/>
                                                }
                                            </div>
                                            <div className={styles.info}>
                                                <div className={styles.title}>{album?.title}</div>
                                                <div className={styles.artist}>{album?.artist?.name}</div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        ) : ''}
                        {album && album?.title ? (
                            <div className={styles.album}>
                                <div className={styles.image}>
                                    {album?.cover ?
                                        <img src={`${process.env.IMAGE_CDN}/${album?.cover}`} alt={album.name}/> :
                                        <AlbumDefault/>}
                                </div>
                                <div className={styles.info}>
                                    <div className={styles.title}>{album?.title}</div>
                                    <div className={styles.artist}>{album?.artist?.name}</div>
                                </div>
                                <button className={styles.remove} onClick={() => {
                                    setTrack({
                                        ...track,
                                        album: null,
                                    })
                                    setAlbum(null)
                                }}>
                                    <CloseIcon stroke={'#eee'} strokeRate={1.25}/>
                                </button>
                            </div>
                        ) : ''}
                    </div>
                    <Input placeholder="Order" className={styles.formField} value={track?.order || 0}
                           onChange={order => setTrack({...track, order: parseInt(order)})}/>
                    <h3 className={styles.formTitle}>Audio</h3>
                    {audio ? (
                        <div className={styles.audio}>
                            <audio src={audio} controls ref={audioElement} onLoadedMetadata={e => {
                                setTrack({
                                    ...track,
                                    duration: e.target?.duration,
                                })
                            }}/>
                        </div>
                    ) : ''}
                    <Button value="Select audio" type="" className={styles.formField}
                            onClick={() => audioRef.current?.click()}/>
                    <h3 className={styles.formTitle}>Genres</h3>
                    {track.genres.map((genre, i) => {
                        return <Input key={i} placeholder={`Genre ${i + 1}`} className={styles.formField}
                                      onChange={value => updateGenre(value, i)}/>
                    })}
                    <Button value="Add genre" type="" className={styles.formField} icon={<AddIcon stroke={'#1c1c1c'}/>}
                            onClick={() => handleAddGenre()}/>
                    <h3 className={styles.formTitle}>Lyrics</h3>
                    <div className={styles.lyrics}>
                        <div className={styles.lyricForm}>
                            <div className={styles.duration}>
                                <Input placeholder="Minute" className={styles.durationField} value={lyric.minute}
                                       onChange={(val, e) => handleLyricTimeInput('minute', val, e)}/>
                                <Input placeholder="Second" className={styles.durationField} value={lyric.second}
                                       onChange={(val, e) => handleLyricTimeInput('second', val, e)}/>
                                <Input placeholder="Millisecond" className={styles.durationField}
                                       value={lyric.millisecond}
                                       onChange={(val, e) => handleLyricTimeInput('millisecond', val, e)}/>
                            </div>
                            <Input placeholder="Lyric" className={`${styles.formField} ${styles.lyricInput}`}
                                   value={lyric.text} onChange={text => setLyric({...lyric, text})}/>
                            <Button value={typeof editLyric !== 'number' ? 'Add lyric' : 'Update lyric'} type=""
                                    className={styles.formField}
                                    icon={typeof editLyric !== 'number' ? <AddIcon stroke={'#1c1c1c'}/> : null}
                                    onClick={handleAddLyric}/>
                        </div>
                        {track?.lyrics?.map((lyric, i) => {
                            return (
                                <div className={styles.lyric} key={i}>
                                    <div className={styles.lyricNumber}>{i + 1}</div>
                                    <div className={styles.lyricTime}>{lyric.start}</div>
                                    <div className={styles.lyricText}>{lyric.text}</div>
                                    <div className={styles.actions}>
                                        {editLyric === i ? '' : (
                                            <>
                                                <button onClick={() => {
                                                    setTrack({
                                                        ...track,
                                                        lyrics: [
                                                            ...track.lyrics.slice(0, i),
                                                            ...track.lyrics.slice(i + 1),
                                                        ],
                                                    })
                                                }}>
                                                    <CloseIcon stroke={'#eee'}/>
                                                </button>
                                                <button onClick={() => setEditLyric(i)}>
                                                    <EditIcon stroke={'#eee'}/>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <Button value="Create track" className={`${styles.formField} ${styles.submitButton}`}
                            icon={<NextIcon stroke={'#1c1c1c'}/>} disabled={disableSubmit}
                            onClick={() => handleSubmit()}/>
                    <input type="file" accept="audio/*" ref={audioRef} onChange={handleAudioFile} className="hide"/>
                </div>
            </div>
        </>
    ) : <></>
}