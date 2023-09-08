import axios from 'axios'
import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import {AddIcon, NextIcon} from '@/icons'
import styles from '@/styles/admin/genres.module.sass'

export default function AdminGenres() {
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get user data from auth context
    const [genres, setGenres] = useState(null) // Genres state
    const [disableSubmit, setDisableSubmit] = useState(false) // Disable submit button

    const getGenres = async () => { // Get genres from API
        try {
            const response = await axios.get(`${process.env.API_URL}/explore/genres`) // Get genres from API

            if (response.data?.status === 'OK') setGenres(response.data?.genres || []) // If the response is OK, set the genres state
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (!user?.loaded) return
        if (!user?.id || !user?.token || !user?.admin) { // If the user is not loaded, not logged in, not an admin, or doesn't have an ID, redirect to the 404 page
            router.push('/404')
            return
        }

        getGenres() // Get genres from API
    }, [user])

    const updateGenre = (value, index) => {
        setGenres([ // Update the genres array
            ...genres.slice(0, index), // Get the genres before the updated genre
            value, // Update the genre
            ...genres.slice(index + 1), // Get the genres after the updated genre
        ])
    }

    const handleAddGenre = () => {
        setGenres([
                ...genres, // Add an empty string to the genres array
                '',
            ])
    }

    const handleSubmit = async () => {
        setDisableSubmit(true) // Disable the submit button

        try {
            const response = await axios.post(`${process.env.API_URL}/admin/genres`, { // Send a POST request to the API
                genres: genres.toString(),
            }, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            })

            if (response.data?.status === 'OK') router.push('/admin') // If the response is OK, redirect to the admin page
        } catch (e) {
            console.error(e)
        } finally {
            setDisableSubmit(false) // Enable the submit button
        }
    }

    return (
        <>
            <Head>
                <title>Edit Genres — Rival Music</title>
            </Head>
            <div className={styles.mainContainer}>
                <h1 className={styles.mainTitle}>Edit Genres</h1>
                <div className={styles.form}>
                    {genres?.length ? genres.map((genre, i) => {
                        return <Input key={i} placeholder={`Genre ${i + 1}`} className={styles.formField}
                                      onChange={value => updateGenre(value, i)} value={genre}/>
                    }) : ''}
                    <Button value="Add genre" type="" className={styles.formField} icon={<AddIcon stroke={'#1c1c1c'}/>}
                            onClick={() => handleAddGenre()}/>
                    <Button value="Update genres" className={styles.formField} disabled={disableSubmit}
                            icon={<NextIcon stroke={'#1c1c1c'}/>} onClick={() => handleSubmit()}/>
                </div>
            </div>
        </>
    )
}