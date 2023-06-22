import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {ModalContext} from '@/contexts/modal'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import {AddIcon} from '@/icons'
import styles from '@/styles/modals.module.sass'

export default function ChangeProfileModal() {
    const [user, setUser] = useContext(AuthContext)
    const [, setAlert] = useContext(AlertContext)
    const [, setModal] = useContext(ModalContext)
    const [name, _setName] = useState('')
    const [file, setFile] = useState(null)
    const [image, setImage] = useState(null)
    const nameRef = useRef(name)
    const fileRef = useRef()

    const setName = value => {
        nameRef.current = value
        _setName(value)
    }

    const triggerFileInput = () => fileRef.current?.click()

    useEffect(() => {
        if (!user) setModal({canClose: true, active: null})
        setName(user.name)
        setImage(user.image)
    }, [user])

    const handleFileSelect = e => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > process.env.PP_MAXSIZE) return setAlert({
            active: true,
            title: 'You reached limits',
            description: 'You can upload images up to 5 MB in size.',
            button: 'OK',
            type: '',
        })

        setFile(file)
        setImage(URL.createObjectURL(file))
    }

    const removeImage = () => {
        setFile(null)
        setImage(null)
    }

    const handleSubmit = async () => {
        if (!user || !user.id) return window.location.reload()

        try {
            const formData = new FormData()
            if (image) formData.append('image', file)
            else if (!image && !file) formData.append('noImage', 'true')
            if (nameRef.current.trim() !== user?.name) formData.append('name', nameRef.current)

            const response = await axios.post(`${process.env.API_URL}/user/update-profile/${user.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            setUser({...user, image: response.data.image, name: response.data.name})
            setModal({canClose: true, active: null})
        } catch (e) {
            setAlert({
                active: true,
                title: 'Something went wrong',
                description: 'An error occurred while saving your new profile photo.',
                button: 'OK',
                type: '',
            })
            setModal({canClose: true, active: null})
        }
    }

    return (
        <div className={styles.changeProfile}>
            <div className={styles.image}>
                {image ? <img src={image.startsWith('blob:') ? image : `${process.env.IMAGE_CDN}/${image}`} alt={1}/> : user?.name[0]?.toUpperCase()}
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
            <Button value="Update Profile" onClick={handleSubmit}/>
            <input type="file" ref={fileRef} className="hide" onChange={handleFileSelect} accept=".png,.jpg,.jpeg"/>
        </div>
    )
}