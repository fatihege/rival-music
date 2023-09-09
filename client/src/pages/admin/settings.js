import axios from 'axios'
import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import Button from '@/components/form/button'
import {NextIcon} from '@/icons'
import styles from '@/styles/admin/admin.module.sass'
import Checkbox from '@/components/form/checkbox'

export default function AdminSettingsPage() {
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get user data from auth context
    const [acceptance, setAcceptance] = useState(false) // Acceptance state
    const [canRequest, setCanRequest] = useState(false) // Acceptance state
    const [disableSubmit, setDisableSubmit] = useState(false) // Disable submit button

    const getAcceptance = async () => { // Get acceptance data from API
        try {
            const response = await axios.get(`${process.env.API_URL}/admin/acceptance`, { // Get acceptance data from API
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                }
            })

            if (response.data?.status === 'OK') setAcceptance(response.data?.acceptance) // If the response is OK, set the acceptance state
        } catch (e) {
            console.error(e)
        }
    }

    const getCanRequest = async () => { // Get acceptance data from API
        try {
            const response = await axios.get(`${process.env.API_URL}/request/can-request`, { // Get data from API
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                }
            })

            if (response.data?.status === 'OK') setCanRequest(response.data?.canRequest) // If the response is OK, set the acceptance state

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

        getAcceptance() // Get acceptance data from API
        getCanRequest() // Get user can request data from API
    }, [user])

    const handleSubmit = async () => {
        setDisableSubmit(true) // Disable the submit button

        axios.post(`${process.env.API_URL}/admin/acceptance`, { // Send a POST request to the API
            acceptance,
        }, {
            headers: {
                Authorization: `Bearer ${user?.token}`,
            },
        }).then(() => {
            axios.post(`${process.env.API_URL}/admin/can-request`, { // Send a POST request to the API
                canRequest,
            }, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            }).then(res => {
                if (res.data?.status === 'OK') router.push('/admin') // If the response is OK, redirect to the admin page
                setDisableSubmit(false) // Enable the submit button
            }).catch(e => console.error(e))
        }).catch(e => console.error(e))
    }

    return (
        <>
            <Head>
                <title>App Settings — Rival Music</title>
            </Head>
            <div className={styles.mainContainer}>
                <h1 className={styles.mainTitle}>Settings</h1>
                <div style={{marginTop: '1rem'}}>
                    <Checkbox label="Users must be accepted by admin" name="acceptance" checked={acceptance}
                              onChange={() => setAcceptance(prev => !prev)}/>
                    <Checkbox label="Users can request tracks" name="request" checked={canRequest}
                              onChange={() => setCanRequest(prev => !prev)}/>
                    <Button value="Update" disabled={disableSubmit} icon={<NextIcon stroke={'#1c1c1c'}/>}
                            onClick={() => handleSubmit()}/>
                </div>
            </div>
        </>
    )
}