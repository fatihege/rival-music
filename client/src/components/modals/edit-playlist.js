import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {ModalContext} from '@/contexts/modal'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import {AddIcon, AlbumDefault} from '@/icons'
import styles from '@/styles/modals.module.sass'
import {LibraryContext} from '@/contexts/library'

export default function EditPlaylistModal({id, setPlaylist}) {
    const [user, setUser] = useContext(AuthContext) // Get user from auth context
    const [, setAlert] = useContext(AlertContext) // Use alert context for showing alert
    const [, setModal] = useContext(ModalContext) // Use modal context for updating modal
    const [, , getUserLibrary] = useContext(LibraryContext) // Use library context for updating library
    const [title, _setTitle] = useState('') // State of title of the playlist
    const [file, setFile] = useState(null) // Selected file data
    const [image, setImage] = useState(null) // The image of the playlist
    const titleRef = useRef(title) // Reference for the title of the playlist
    const fileRef = useRef() // Reference for the selected file

    const setTitle = value => { // Update name state
        titleRef.current = value
        _setTitle(value)
    }

    const triggerFileInput = () => fileRef.current?.click() // Trigger the file input's click event

    const getPlaylistData = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/playlist/${id}`) // Get playlist data from API
            if (response.data?.status === 'OK') { // If response status is OK
                if (response.data?.playlist) {
                    setTitle(response.data.playlist.title) // Set title state
                    setImage(response.data.playlist.image) // Set image state
                }
            }
        } catch (e) {
            console.error(e)
            setAlert({ // Show an alert
                active: true,
                title: 'Something went wrong',
                description: 'An error occurred while getting playlist data.',
                button: 'OK',
                type: '',
            })
        }
    }

    useEffect(() => {
        if (!id) return // If ID property is not defined, return
        getPlaylistData() // Get playlist data
    }, [id])

    useEffect(() => { // On user state change
        if (!user.loaded) return
        if (!user?.id || !user?.token) return setModal({canClose: true, active: null}) // If there is no user, close the modal and return
    }, [user])

    const handleFileSelect = e => {
        const file = e.target.files[0] // Get the file
        if (!file) return // If there is no file, return

        if (file.size > process.env.PP_MAXSIZE) return setAlert({ // If the file's size is larger than limit, return an alert
            active: true,
            title: 'You reached limits',
            description: 'You can upload images up to 5 MB in size.',
            button: 'OK',
            type: '',
        })

        // Otherwise,
        setFile(file) // Update selected file state
        setImage(URL.createObjectURL(file)) // Create an object URL for the image file and set the image state
    }

    const removeImage = () => {
        setFile(null) // Reset the selected file state
        setImage(null) // Reset the user's image state
    }

    const handleSubmit = async () => {
        if (!user?.loaded) return
        if (!user?.id) return window.location.reload() // If there is no user, reload the page

        try {
            const formData = new FormData() // Initialize a form data

            if (image) formData.append('image', file) // If image state is defined, add an entry to the form data
            else if (!image && !file) formData.append('noImage', 'true') // Otherwise, set noImage entry to true if image and file states are not defined

            if (titleRef.current?.trim() !== user?.name) formData.append('title', titleRef.current) // If name is changed, add an entry to the form data

            const response = await axios.post(`${process.env.API_URL}/playlist/update/${id}`, formData, { // Send POST request to the API and get response
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                }
            })

            if (response.data.status === 'OK') { // If response status is OK
                setPlaylist(prev => ({ // Update playlist state
                    ...prev,
                    title: response.data?.title,
                    image: response.data?.image,
                    covers: response.data?.covers,
                }))
                getUserLibrary() // Update user library
                setModal({canClose: true, active: null}) // Close modal
            }
        } catch (e) { // If there is an error
            setAlert({ // Show an alert
                active: true,
                title: 'Something went wrong',
                description: 'An error occurred while saving your new profile photo.',
                button: 'OK',
                type: '',
            })
            setModal({canClose: true, active: null}) // Close the modal
        }
    }

    return (
        <div className={styles.editPlaylist}>
            <div className={styles.image}>
                {image ? <img src={image.startsWith('blob:') ? image : `${process.env.IMAGE_CDN}/${image}`} alt="Playlist image"/> : <AlbumDefault/>}
                <div className={styles.imageOverlay} onClick={() => triggerFileInput()}>
                    <AddIcon/>
                    <span>Upload Photo</span>
                </div>
            </div>
            {image ? (
                <div className={styles.removeImage}>
                    <Button value="Remove" type="noBackground" className={styles.removeImageBtn} onClick={() => removeImage()}/>
                </div>
            ) : ''}
            <div className={styles.title}>
                <Input placeholder="Playlist title" value={titleRef.current} set={titleRef}/>
            </div>
            <Button value="Update Playlist" onClick={handleSubmit}/>
            <input type="file" ref={fileRef} className="hide" onChange={handleFileSelect} accept=".png,.jpg,.jpeg"/>
        </div>
    )
}