import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import Input from '@/components/form/input'
import Textarea from '@/components/form/textarea'
import Button from '@/components/form/button'
import {AddIcon, NextIcon} from '@/icons'
import styles from '@/styles/admin/create-artist.module.sass'

// Overlay component
const Overlay = ({handler}) => (
    <div className={styles.overlay} onClick={handler}>
        <div className={styles.icon}>
            <AddIcon/>
        </div>
        Upload Photo
    </div>
)

export default function CreateArtistPage() {
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get the user state from the auth context
    const [, setAlert] = useContext(AlertContext) // Get the alert state from the alert context
    const [artist, setArtist] = useState({ // Artist state
        name: '',
        description: '',
        genres: [''],
    })
    const [banner, setBanner] = useState(null) // Banner state
    const [bannerImage, setBannerImage] = useState(null) // Banner image state
    const [profile, setProfile] = useState(null) // Profile state
    const [profileImage, setProfileImage] = useState(null) // Profile image state
    const bannerRef = useRef() // Banner input reference
    const profileRef = useRef() // Profile input reference
    const [disableSubmit, setDisableSubmit] = useState(false) // Is submit button disabled

    useEffect(() => {
        if (!artist.name.trim().length) // If the name input is empty
            setDisableSubmit(true) // Disable submit button
        else setDisableSubmit(false) // Otherwise, enable submit button
    }, [artist])

    useEffect(() => {
        if (user.loaded && !user?.admin) router.push('/404') // If the user is not an admin, redirect to 404 page
    }, [user])

    const handleBannerSelect = e => {
        const file = e.target.files[0] // Get the file
        if (!file) return // If there is no file, return

        // Otherwise,
        setBanner(file) // Update the banner state
        setBannerImage(URL.createObjectURL(file)) // Create an object URL for the banner image and set the banner image state
    }

    const handleProfileSelect = e => {
        const file = e.target.files[0] // Get the file
        if (!file) return // If there is no file, return

        // Otherwise,
        setProfile(file) // Update the profile state
        setProfileImage(URL.createObjectURL(file)) // Create an object URL for the profile image and set the profile image state
    }

    const handleAddGenre = () => {
        setArtist({
            ...artist,
            genres: [
                ...artist.genres, // Add an empty string to the genres array
                '',
            ],
        })
    }

    const updateGenre = (value, index) => {
        setArtist({
            ...artist,
            genres: [ // Update the genres array
                ...artist.genres.slice(0, index), // Get the genres before the updated genre
                value, // Update the genre
                ...artist.genres.slice(index + 1), // Get the genres after the updated genre
            ],
        })
    }

    const handleSubmit = async () => {
        if (!artist.name?.trim().length) return // If the name input is empty, return

        try {
            const formData = new FormData() // Initialize a form data

            if (banner) formData.append('banner', banner) // If banner is not empty, add an entry to the form data
            if (profile) formData.append('profile', profile) // If profile picture is not empty, add an entry to the form data
            formData.append('name', artist.name) // Add artist name entry to the form data
            formData.append('description', artist.description) // Add artist description entry to the form data
            formData.append('genres', artist.genres.toString()) // Add artist genres as an entry to the form data

            const response = await axios.post(`${process.env.API_URL}/admin/${user.token}/artist/create`, formData, { // Send POST request to the API and get response
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (response.data.status === 'OK' && response.data.id) // If response status is OK
                return router.push(`/artist/${response.data.id}`) // Open artist profile
        } catch (e) { // If there is an error
            setAlert({ // Show an alert
                active: true,
                title: 'Something went wrong',
                description: 'An error occurred while creating the artist.',
                button: 'OK',
                type: '',
            })
            console.error(e)
        }
    }

    return user.loaded && user?.admin ? (
        <>
            <Head>
                <title>Create Artist — Rival Music</title>
            </Head>
            <div className={styles.mainContainer}>
                <h1 className={styles.mainTitle}>Create Artist</h1>
                <div className={styles.artistPreview}>
                    <span className={styles.recommendation}>Recommended dimensions are 2400x933</span>
                    <div className={styles.banner}>
                        {bannerImage ? <img src={bannerImage} alt={'Artist Banner Preview'}/> : ''}
                        <Overlay handler={() => bannerRef.current?.click()}/>
                    </div>
                    <div className={styles.profileSection}>
                        <div className={styles.profileImage}>
                            {profileImage ? <img src={profileImage} alt={'Artist Profile Photo Preview'}/> : ''}
                            <Overlay handler={() => profileRef.current?.click()}/>
                        </div>
                        <div className={styles.artistInfo}>
                            <div className={`${styles.artistName} ${artist.name?.length ? styles.fill : ''}`}>{artist.name}</div>
                            <div className={`${styles.artistDescription} ${artist.description?.length ? styles.fill : ''}`}>{artist.description}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.form}>
                    <Input placeholder="Artist name" onChange={name => setArtist({...artist, name})} className={styles.formField}/>
                    <Textarea placeholder="Artist description" onChange={description => setArtist({...artist, description})} className={styles.formField}/>
                    <h3 className={styles.genresTitle}>Genres</h3>
                    {artist.genres.map((genre, i) => {
                        return <Input key={i} placeholder={`Genre ${i + 1}`} className={styles.formField} onChange={value => updateGenre(value, i)}/>
                    })}
                    <Button value="Add genre" type="" className={styles.formField} icon={<AddIcon stroke={'#1c1c1c'}/>} onClick={() => handleAddGenre()}/>
                    <Button value="Create artist" className={`${styles.formField} ${styles.submitButton}`} icon={<NextIcon stroke={'#1c1c1c'}/>} disabled={disableSubmit} onClick={() => handleSubmit()}/>
                    <input type="file" ref={bannerRef} className="hide" onChange={handleBannerSelect} accept=".png,.jpg,.jpeg"/>
                    <input type="file" ref={profileRef} className="hide" onChange={handleProfileSelect} accept=".png,.jpg,.jpeg"/>
                </div>
            </div>
        </>
    ) : <></>
}