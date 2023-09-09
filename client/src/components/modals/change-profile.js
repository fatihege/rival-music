import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {ModalContext} from '@/contexts/modal'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import {RGBtoString} from '@/utils/color-converter'
import getUserData from '@/utils/get-user-data'
import {AddIcon} from '@/icons'
import styles from '@/styles/modals.module.sass'

export default function ChangeProfileModal({user: [activeUser, setActiveUser]}) {
    const [user, setUser] = useContext(AuthContext) // Use auth context for getting/setting user
    const [, setAlert] = useContext(AlertContext) // Use alert context for showing alert
    const [, setModal] = useContext(ModalContext) // Use modal context for updating modal
    const [name, _setName] = useState('') // State of name of the user
    const [email, _setEmail] = useState('') // State of email of the user
    const [password, _setPassword] = useState('') // State of password of the user
    const [profileColor, _setProfileColor] = useState(null) // State of profile color of the user
    const [accentColor, _setAccentColor] = useState(null) // State of accent color of the user
    const [file, setFile] = useState(null) // Selected file data
    const [image, setImage] = useState(null) // The user's profile image state
    const nameRef = useRef(name) // Reference for the user's name state
    const emailRef = useRef(email) // Reference for the user's email state
    const passwordRef = useRef(password) // Reference for the user's password state
    const profileColorRef = useRef(profileColor) // Reference for the user's profile color state
    const accentColorRef = useRef(accentColor) // Reference for the user's accent color state
    const fileRef = useRef() // Reference for the selected file
    const profileColorPreviewRef = useRef() // Reference for profile color preview element
    const accentColorPreviewRef = useRef() // Reference for accent color preview element

    const setName = value => { // Update name state
        nameRef.current = value
        _setName(value)
    }

    const setEmail = value => { // Update email state
        emailRef.current = value
        _setEmail(value)
    }

    const setPassword = value => { // Update password state
        passwordRef.current = value
        _setPassword(value)
    }

    const setProfileColor = value => { // Update profile color state
        profileColorRef.current = value
        _setProfileColor(value)
    }

    const setAccentColor = value => { // Update accent color state
        accentColorRef.current = value
        _setAccentColor(value)
    }

    const triggerFileInput = () => fileRef.current?.click() // Trigger the file input's click event

    const getUserProfileColors = async () => {
        if (profileColorRef.current?.length && accentColorRef.current?.length) return // If the profile color and the accent color is defined, return

        const userData = await getUserData(activeUser.id, 'profileColor,accentColor', user?.admin ? user?.id : null) // Get profile color and accent color of the active user

        if (userData?.profileColor && Array.isArray(userData?.profileColor) && userData?.profileColor.length === 3) // If profile color is defined, and it's an array, and the length of the array is equal to 3
            setProfileColor(userData.profileColor) // Update the profile color state
        if (userData?.accentColor && Array.isArray(userData?.accentColor) && userData?.accentColor.length === 3) // If accent color is defined, and it's an array, and the length of the array is equal to 3
            setAccentColor(userData.accentColor) // Update the accent color state
    }

    useEffect(() => { // On user state change
        if (!user.loaded) return
        if (!user?.id || (activeUser?.id !== user?.id && !user?.admin)) return setModal({canClose: true, active: null}) // If there is no user, close the modal and return
        setName(activeUser.name) // Set name state to the user's name
        if (user?.admin) setEmail(activeUser.email) // Set email state to the user's email
        setImage(activeUser.image) // Set image state to the user's profile image
        getUserProfileColors() // Get user's colors from API
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

            if (file) formData.append('image', file) // If image state is defined, add an entry to the form data
            else if (!image && !file) formData.append('noImage', 'true') // Otherwise, set noImage entry to true if image and file states are not defined

            if (nameRef.current?.trim() !== activeUser?.name) formData.append('name', nameRef.current) // If name is changed, add an entry to the form data
            if (emailRef.current?.trim() !== activeUser?.email && user?.admin) formData.append('email', emailRef.current) // If email is changed, add an entry to the form data
            if (passwordRef.current?.trim()?.length && user?.admin) formData.append('password', passwordRef.current) // If password is changed, add an entry to the form data

            if (!activeUser.profileColor || activeUser.profileColor?.toString() !== profileColorRef.current?.toString()) // If the user is not has a profile color or the new profile color value is different from the user's profile color
                formData.append('profileColor', profileColorRef.current.toString()) // Add an entry to the form data for profile color

            if (!activeUser.accentColor || activeUser.accentColor?.toString() !== accentColorRef.current?.toString()) // If the user is not has an accent color or the new accent color value is different from the user's accent color
                formData.append('accentColor', accentColorRef.current.toString()) // Add an entry to the form data for accent color

            const response = await axios.post(`${process.env.API_URL}/user/update-profile${activeUser && user?.admin ? `?user=${activeUser?._id || activeUser?.id}` : ''}`, formData, { // Send POST request to the API and get response
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                }
            })

            if (response.data.status === 'OK') { // If response status is OK
                if (!activeUser) setUser({ // Update the current user state
                    ...user,
                    image: response.data.image,
                    name: response.data.name,
                    profileColor: response.data.profileColor,
                    accentColor: response.data.accentColor
                })
                else setActiveUser({ // Update the active user state
                    ...activeUser,
                    image: response.data.image,
                    name: response.data.name,
                    email: response.data.email,
                    profileColor: response.data.profileColor,
                    accentColor: response.data.accentColor
                })
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

    const rgbValidator = value => !value?.length || isNaN(Number(value)) || parseInt(value) < 0 || parseInt(value) > 255 ?
        'The value must be number in the range of 0-255' : null // If the value is number and is in the range of 0-255, don't return an alert. Otherwise, return an alert

    const updateProfileColor = (i, value) => {
        const newColor = profileColorRef.current // Get new color value
        if (!newColor || isNaN(Number(value))) return // If there is no color or the value is not a number, return
        newColor[i] = Number(value) // Update the color of index
        setProfileColor(newColor) // Update the state
        if (profileColorPreviewRef.current?.style)
            profileColorPreviewRef.current.style.backgroundColor = RGBtoString(profileColorRef.current) // Update background color of the preview element
    }

    const updateAccentColor = (i, value) => {
        const newColor = accentColorRef.current // Get new color value
        if (!newColor || isNaN(Number(value))) return // If there is no color or the value is not a number, return
        newColor[i] = Number(value) // Update the color of index
        setAccentColor(newColor) // Update the state
        if (accentColorPreviewRef.current?.style)
            accentColorPreviewRef.current.style.backgroundColor = RGBtoString(accentColorRef.current) // Update background color of the preview element
    }

    return (
        <div className={styles.changeProfile}>
            <div className={styles.image}>
                {image ? <img src={image.startsWith('blob:') ? image : `${process.env.IMAGE_CDN}/${image}`} alt="Profile"/> : user?.name?.[0]?.toUpperCase()}
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
            <div className={styles.username}>
                <Input placeholder="Your name" value={nameRef.current} set={nameRef}/>
            </div>
            <div className={styles.colorField}>
                <div className={styles.colorPreview}>
                    <div className={styles.color} ref={profileColorPreviewRef}></div>
                </div>
                <div className={styles.inputGroup}>
                    <Input placeholder="Red" className={styles.colorInput} value={(profileColor ? profileColor[0] : 255).toString()} validator={rgbValidator} onChange={value => updateProfileColor(0, Number(value))}/>
                    <Input placeholder="Green" className={styles.colorInput} value={(profileColor ? profileColor[1] : 255).toString()} validator={rgbValidator} onChange={value => updateProfileColor(1, Number(value))}/>
                    <Input placeholder="Blue" className={styles.colorInput} value={(profileColor ? profileColor[2] : 255).toString()} validator={rgbValidator} onChange={value => updateProfileColor(2, Number(value))}/>
                </div>
            </div>
            <div className={styles.colorField}>
                <div className={styles.colorPreview}>
                    <div className={styles.color} ref={accentColorPreviewRef}></div>
                </div>
                <div className={styles.inputGroup}>
                    <Input placeholder="Red" className={styles.colorInput} value={(accentColor ? accentColor[0] : 255).toString()} validator={rgbValidator} onChange={value => updateAccentColor(0, Number(value))}/>
                    <Input placeholder="Green" className={styles.colorInput} value={(accentColor ? accentColor[1] : 255).toString()} validator={rgbValidator} onChange={value => updateAccentColor(1, Number(value))}/>
                    <Input placeholder="Blue" className={styles.colorInput} value={(accentColor ? accentColor[2] : 255).toString()} validator={rgbValidator} onChange={value => updateAccentColor(2, Number(value))}/>
                </div>
            </div>
            {user?.admin && activeUser?._id !== user?.id ? (
                <>
                    <Input placeholder="Email" value={emailRef.current} set={emailRef}/>
                    <Input placeholder="New password" type="password" value={passwordRef.current} set={passwordRef}/>
                </>
            ) : ''}
            <Button value="Update Profile" onClick={handleSubmit}/>
            <input type="file" ref={fileRef} className="hide" onChange={handleFileSelect} accept=".png,.jpg,.jpeg"/>
        </div>
    )
}