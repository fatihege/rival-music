import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {DialogueContext} from '@/contexts/dialogue'
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

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

export default function EditArtistPage({id}) {
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get the user state from the auth context
    const [, setAlert] = useContext(AlertContext) // Get the alert state from the alert context
    const [, setDialogue] = useContext(DialogueContext) // Get the dialogue state from the dialogue context
    const [artist, setArtist] = useState({ // Artist state
        id: null,
        banner: null,
        image: null,
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
        if (user?.loaded && !user?.admin) router.push('/404') // If the user is not an admin, redirect to 404 page
        if (user?.loaded && user?.admin) getArtistData() // If the user is an admin, get artist data from API
    }, [user])

    const getArtistData = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/artist/${id}`) // Get artist data from API

            if (response.data?.status === 'OK' && response.data?.artist) { // If response is OK
                const {_id, banner, image, name, description, genres} = response.data.artist // Get artist data
                setArtist({ // Set artist state
                    id: _id,
                    banner,
                    image,
                    name,
                    description,
                    genres,
                })
            }
        } catch (e) { // If an error occurred
            setAlert({ // Show alert
                active: true,
                title: 'Cannot get artist data',
                message: 'An error occurred while retrieving artist data.',
                button: 'OK',
                type: '',
            })
            console.error(e)
        }
    }

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

            if (bannerImage) formData.append('banner', banner) // If there is a banner image, add banner entry to the form data
            if (profileImage) formData.append('profile', profile) // If there is a profile image, add profile entry to the form data
            if (!artist.banner && !banner) formData.append('noBanner', true) // If there is no banner, add null banner entry to the form data
            if (!artist.image && !profile) formData.append('noProfile', true) // If there is no profile, add null profile entry to the form data
            formData.append('name', artist.name) // Add artist name entry to the form data
            formData.append('description', artist.description) // Add artist description entry to the form data
            formData.append('genres', artist.genres.toString()) // Add artist genres as an entry to the form data

            const response = await axios.post(`${process.env.API_URL}/admin/${user.token}/artist/update/${artist?.id}`, formData, { // Send POST request to the API and get response
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (response.data.status === 'OK' && response.data.id) // If response status is OK
                return router.push('/artist/[id]', `/artist/${response.data.id}`) // Open artist profile
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

    const handleDeleteArtist = () => {
        setDialogue({
            active: true,
            title: 'Delete Artist',
            description: 'Are you sure you want to delete this artist?',
            button: 'Delete Artist',
            type: 'danger',
            callback: async () => {
                try {
                    await axios.delete(`${process.env.API_URL}/admin/${user.token}/artist/${artist?.id}`, {
                        headers: {
                            Authorization: `Bearer ${user?.token}`,
                        },
                    })
                    router.push('/admin/artist/all')
                } catch (e) {
                    console.error(e)
                    setAlert({
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

    return user.loaded && user?.admin ? (
        <>
            <Head>
                <title>Edit Artist{artist?.name ? `: ${artist?.name?.toString()}` : ''} {process.env.SEPARATOR} {process.env.APP_NAME}</title>
            </Head>
            <div className={styles.mainContainer}>
                <h1 className={styles.mainTitle}>Edit Artist</h1>
                <div className={styles.artistPreview}>
                    <span className={styles.recommendation}>Recommended dimensions are 2400x933</span>
                    <div className={styles.banner}>
                        {bannerImage ? <img src={bannerImage} alt={'Artist Banner Preview'}/> : artist?.banner ? <img src={`${process.env.API_URL}/uploads/${artist.banner}`} alt={'Artist Banner Preview'}/> : ''}
                        <Overlay handler={() => bannerRef.current?.click()}/>
                    </div>
                    {artist?.banner || bannerImage ? <button onClick={() => {
                        setArtist({...artist, banner: null})
                        setBanner(null)
                        setBannerImage(null)
                        bannerRef.current.value = null
                    }} className={styles.removeButton}>Remove banner</button> : ''}
                    <div className={styles.profileSection}>
                        <div>
                            <div className={styles.profileImage}>
                                {profileImage ? <img src={profileImage} alt={'Artist Profile Photo Preview'}/> : artist?.image ? <img src={`${process.env.API_URL}/uploads/${artist.image}`} alt={'Artist Profile Photo Preview'}/> : ''}
                                <Overlay handler={() => profileRef.current?.click()}/>
                            </div>
                            {artist?.image || profileImage ? <button onClick={() => {
                                setArtist({...artist, image: null})
                                setProfile(null)
                                setProfileImage(null)
                                profileRef.current.value = null
                            }} className={styles.removeButton}>Remove profile</button> : ''}
                        </div>
                        <div className={styles.artistInfo}>
                            <div className={`${styles.artistName} ${artist.name?.length ? styles.fill : ''}`}>{artist.name}</div>
                            <div className={`${styles.artistDescription} ${artist.description?.length ? styles.fill : ''}`}>{artist.description}</div>
                        </div>
                    </div>
                </div>
                <div className={styles.form}>
                    <Input placeholder="Artist name" onChange={name => setArtist({...artist, name})} className={styles.formField} value={artist.name}/>
                    <Textarea placeholder="Artist description" onChange={description => setArtist({...artist, description})} className={styles.formField} value={artist.description}/>
                    <h3 className={styles.genresTitle}>Genres</h3>
                    {artist.genres.map((genre, i) => {
                        return <Input key={i} placeholder={`Genre ${i + 1}`} className={styles.formField} onChange={value => updateGenre(value, i)} value={artist.genres[i]}/>
                    })}
                    <Button value="Add genre" type="" className={styles.formField} icon={<AddIcon stroke={'#1c1c1c'}/>} onClick={() => handleAddGenre()}/>
                    <Button value="Update artist" className={`${styles.formField} ${styles.submitButton}`} icon={<NextIcon stroke={'#1c1c1c'}/>} disabled={disableSubmit} onClick={() => handleSubmit()}/>
                    <Button value="Delete artist" type="danger" className={styles.formField} onClick={() => handleDeleteArtist()}/>
                    <input type="file" ref={bannerRef} className="hide" onChange={handleBannerSelect} accept=".png,.jpg,.jpeg"/>
                    <input type="file" ref={profileRef} className="hide" onChange={handleProfileSelect} accept=".png,.jpg,.jpeg"/>
                </div>
            </div>
        </>
    ) : <></>
}