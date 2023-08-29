import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {ModalContext} from '@/contexts/modal'
import {AlertContext} from '@/contexts/alert'
import CustomScrollbar from '@/components/custom-scrollbar'
import AskLoginModal from '@/components/modals/ask-login'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import {checkNameField, checkEmailField, checkPasswordField, checkPasswordConfirmField} from '@/utils/checkers'
import styles from '@/styles/account.module.sass'

export default function AccountPage() {
    const router = useRouter()
    const [user, setUser] = useContext(AuthContext) // Get user from auth context
    const [, setModal] = useContext(ModalContext) // Use modal context
    const [, setAlertPopup] = useContext(AlertContext) // Use alert context
    const name = useRef('') // Name value reference
    const email = useRef('') // Email value reference
    const currentPassword = useRef('') // Current password value reference
    const newPassword = useRef('') // New password value reference
    const passwordConfirm = useRef('') // Password confirmation value reference
    const [disableInformationSubmit, setDisableInformationSubmit] = useState(false) // Is submit button disabled on information update form
    const [disablePasswordSubmit, setDisablePasswordSubmit] = useState(false) // Is submit button disabled on password update form
    const [alert, _setAlert] = useState({ // Alert state
        name: null,
        email: null,
        currentPassword: null,
        password: null,
        passwordConfirm: null,
    })
    const alertRef = useRef(alert) // Alert state reference

    const setAlert = value => { // Set alert state and reference value
        alertRef.current = value
        _setAlert(value)
    }

    useEffect(() => {
        if (alertRef.current.name || alertRef.current.email || !name.current.trim().length || !email.current.trim().length || (name.current.trim() === user.name && email.current.trim() === user.email)) // If name and email field has an alert or their value is empty or not different, disable submit button
            setDisableInformationSubmit(true)
        else setDisableInformationSubmit(false) // Otherwise, enable it

        if (alertRef.current.password || alertRef.current.passwordConfirm || !currentPassword.current.length || !newPassword.current.length || !passwordConfirm.current.length) // If password fields has an alert or their value is empty, disable submit button
            setDisablePasswordSubmit(true)
        else setDisablePasswordSubmit(false) // Otherwise, enable it
    }, [alertRef.current])

    useEffect(() => {
        if (!user.loaded) return // If the user information is not loaded, return

        if (!user?.id) { // If the user state does not have an ID
            router.push('/') // Return to home page
            return setModal({canClose: true, active: <AskLoginModal/>}) // Ask for login and return
        }

        name.current = user.name // Fill the name field
        email.current = user.email // Fill the email field
    }, [user])

    const handleInformationSubmit = async () => {
        if (!user?.loaded) return // If the user information is not loaded, return
        if (!user?.id) return router.push('/') // If the user state does not have an ID, return to home page
        if (!name.current?.length || !email.current?.length || alertRef.current.name || alertRef.current.email) return // If the fields are empty or has an alert, return

        try {
            setDisableInformationSubmit(true) // Disable submit button

            const response = await axios.post(`${process.env.API_URL}/user/update`, { // Send POST request
                name: name.current?.trim(),
                email: email.current?.trim(),
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })

            if (response.data?.status === 'OK') { // If response status is OK
                setUser({ // Update the current user state
                    ...user,
                    name: response.data.name,
                    email: response.data.email,
                })
            } else throw new Error() // Otherwise, throw an empty error
        } catch (e) {
            if (e.response && e.response.data.errors && Array.isArray(e.response.data.errors) && e.response.data.errors.length) // If there is an error from axios response
                for (const error of e.response.data.errors) setAlert({ // Update alerts
                    ...alertRef.current,
                    [error.field]: error.message
                })
            else {
                setAlertPopup({ // Otherwise, show an alert
                    active: true,
                    title: 'We have a problem',
                    description: 'An error occurred while updating your information. Try again later or contact with site owner.',
                    button: 'OK',
                    type: ''
                })
                console.error(e)
            }

            setDisableInformationSubmit(false) // Enable submit button
        }
    }

    const handlePasswordSubmit = async () => {
        if (!user?.loaded) return // If the user information is not loaded, return
        if (!user?.id) return router.push('/') // If the user state does not have an ID, return to home page
        if (!currentPassword.current?.length || !newPassword.current?.length || !passwordConfirm.current?.length || alertRef.current.password || alertRef.current.passwordConfirm) return // If the fields are empty or has an alert, return

        try {
            setDisablePasswordSubmit(true) // Disable submit button

            const response = await axios.post(`${process.env.API_URL}/user/update`, { // Send POST request
                currentPassword: currentPassword.current,
                newPassword: newPassword.current,
                passwordConfirm: passwordConfirm.current,
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })

            if (response.data.status === 'OK') { // If response status is OK
                // Clear password fields
                currentPassword.current = ''
                newPassword.current = ''
                passwordConfirm.current = ''

                setAlertPopup({ // Show an alert
                    active: true,
                    title: 'Your password changed',
                    description: 'Your password successfully changed.',
                    button: 'OK',
                    type: 'primary'
                })
            } else throw new Error() // Otherwise, throw an empty error
        } catch (e) {
            if (e.response && e.response.data.errors && Array.isArray(e.response.data.errors) && e.response.data.errors.length) // If there is an error from axios response
                for (const error of e.response.data.errors) setAlert({ // Update alerts
                    ...alertRef.current,
                    [error.field]: error.message
                })
            else {
                setAlertPopup({ // Otherwise, show an alert
                    active: true,
                    title: 'We have a problem',
                    description: 'An error occurred while changing your password. Try again later or contact with site owner.',
                    button: 'OK',
                    type: ''
                })
                console.error(e)
            }

            setDisablePasswordSubmit(false) // Enable submit button
        }
    }

    return (
        <>
            <Head>
                <title>Account — Rival Music</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <h1 className={styles.pageTitle}>Account Information</h1>
                        <div className={styles.form}>
                            {user.loaded ? (
                                <>
                                    <Input type="text" placeholder="Your name" value={name.current}
                                           set={name} alert={alert.name} onChange={checkNameField(name, alertRef, setAlert)}/>
                                    <Input type="text" placeholder="Your email" value={email.current}
                                           set={email} alert={alert.email} onChange={checkEmailField(email, alertRef, setAlert)}/>
                                    <Button value="Update Account" onClick={handleInformationSubmit}
                                            disabled={disableInformationSubmit}/>
                                </>
                            ) : ''}
                        </div>
                        <h1 className={styles.pageTitle}>Change Password</h1>
                        <div className={styles.form}>
                            {user.loaded ? (
                                <>
                                    <Input type="password" placeholder="Current Password" set={currentPassword} value={currentPassword.current} alert={alert.currentPassword}
                                           onChange={() => {setAlert({...alertRef.current, currentPassword: null})}}/>
                                    <Input type="password" placeholder="New Password" set={newPassword} value={newPassword.current} alert={alert.password}
                                           onChange={checkPasswordField(newPassword, passwordConfirm, alertRef, setAlert)}/>
                                    <Input type="password" placeholder="Confirm Password" set={passwordConfirm} value={passwordConfirm.current} alert={alert.passwordConfirm}
                                           onChange={checkPasswordConfirmField(newPassword, passwordConfirm, alertRef, setAlert)}/>
                                    <Button value="Change Password" onClick={handlePasswordSubmit}
                                            disabled={disablePasswordSubmit}/>
                                </>
                            ) : ''}
                        </div>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}