import axios from 'axios'
import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import {AlertContext} from '@/contexts/alert'
import {ModalContext} from '@/contexts/modal'
import LoginModal from '@/components/modals/login'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import styles from '@/styles/reset-password.module.sass'
import {checkPasswordConfirmField, checkPasswordField} from '@/utils/checkers'

export function getServerSideProps(context) {
    return {
        props: {
            token: context.params.token,
        },
    }
}

export default function ResetPasswordPage({token}) {
    const router = useRouter()
    const [, setAlertPopup] = useContext(AlertContext) // Use alert context
    const [, setModal] = useContext(ModalContext) // Use modal context
    const [showForm, setShowForm] = useState(false) // Is form visible
    const password = useRef('') // Password value reference
    const passwordConfirm = useRef('') // Password confirm value reference
    const [disableSubmit, setDisableSubmit] = useState(false) // Is submit button disabled
    const [alert, _setAlert] = useState({ // Alert state
        name: null,
        email: null,
        password: null,
        passwordConfirm: null,
    })
    const alertRef = useRef(alert) // Alert state reference

    const setAlert = value => { // Set alert state and reference value
        alertRef.current = value
        _setAlert(value)
    }

    useEffect(() => {
        if (alertRef.current.password || alertRef.current.passwordConfirm || !password.current.length || !passwordConfirm.current.length) // If alerts is not empty or inputs are empty
            setDisableSubmit(true) // Disable submit button
        else setDisableSubmit(false) // Otherwise, enable submit button
    }, [alertRef.current])

    useEffect(() => {
        if (!token) return // If token is not defined, return

        axios.post(`${process.env.API_URL}/user/check-password-token`, {token}) // Send POST request to the API
            .then(response => {
                if (response.data?.status === 'OK') // If there is status data in the response
                    setShowForm(true) // Show form
                else throw new Error()

                setModal({
                    active: null,
                    canClose: true,
                })
            })
            .catch(e => {
                console.error(e)

                setModal({
                    active: null,
                    canClose: true,
                })

                if (e?.response?.data?.status === 'TOKEN_EXPIRED') { // If there is TOKEN_EXPIRED error
                    setAlertPopup({ // Show an alert
                        active: true,
                        title: 'Password reset link expired',
                        description: e?.response?.data?.newToken ?
                            'Your password reset link has expired. We sent you a new link to your email address.' :
                            'Your password reset link has expired. Please try again later.',
                        button: 'OK',
                        type: '',
                    })
                    router.push('/')
                } else if (e?.response?.data?.status === 'USER_NOT_FOUND') { // If there is USER_NOT_FOUND error
                    setAlertPopup({ // Show an alert
                        active: true,
                        title: 'No user found',
                        description: 'No user found with this password reset link. Please try again later.',
                        button: 'OK',
                        type: '',
                    })
                    router.push('/')
                } else {
                    setAlertPopup({ // Otherwise, show an alert
                        active: true,
                        title: 'We are sorry',
                        description: 'An unknown error occurred. Please try again later.',
                        button: 'OK',
                        type: '',
                    })
                    router.push('/')
                }
            })
    }, [token])

    const handleSubmit = async () => {
        if (alert.password || alert.passwordConfirm) return // If there is an alert, return

        try {
            const response = await axios.post(`${process.env.API_URL}/user/reset-password`, { // Send POST request for
                token,
                password: password.current,
                passwordConfirm: passwordConfirm.current,
            })

            if (response.data?.status === 'OK') { // If response is OK
                router.push('/')
                setAlertPopup({ // Show an alert
                    active: true,
                    title: 'Password reset',
                    description: 'Your password has been reset successfully. You can now login with your new password.',
                    button: 'OK',
                    type: 'primary',
                })
                setModal({canClose: true, active: <LoginModal/>}) // Show login modal
            } else throw new Error()
        } catch (e) { // If there is an error
            if (e.response && e.response.data.errors && Array.isArray(e.response.data.errors) && e.response.data.errors.length) // If there is an error from axios response
                for (const error of e.response.data.errors) setAlert({ // Update alerts
                    ...alertRef.current,
                    [error.field]: error.message
                })
            else if (e?.response?.data?.status === 'TOKEN_EXPIRED') // If there is TOKEN_EXPIRED error
                setAlertPopup({ // Show an alert
                    active: true,
                    title: 'Password reset link expired',
                    description: e?.response?.data?.newToken ?
                        'Your password reset link has expired. We sent you a new link to your email address.' :
                        'Your password reset link has expired. Please try again later.',
                    button: 'OK',
                    type: '',
                })
            else if (e?.response?.data?.status === 'USER_NOT_FOUND') // If there is USER_NOT_FOUND error
                setAlertPopup({ // Show an alert
                    active: true,
                    title: 'No user found',
                    description: 'No user found with this password reset link. Please try again later.',
                    button: 'OK',
                    type: '',
                })
            else {
                setAlertPopup({ // Otherwise, show an alert
                    active: true,
                    title: 'We are sorry',
                    description: 'An error occurred while resetting your password. Try again later or contact with site owner.',
                    button: 'OK',
                    type: ''
                })
                console.error(e)
            }
        }
    }

    return (
        <>
            <Head>
                <title>Reset Your Password — Rival Music</title>
            </Head>
            {showForm && (
                <div className={styles.container}>
                    <div className={styles.form}>
                        <h1>Reset Your Password</h1>
                        <Input type="password" placeholder="Create a password" autoComplete="off" set={password} alert={alert.password}
                               onChange={checkPasswordField(password, passwordConfirm, alertRef, setAlert)}/>
                        <Input type="password" placeholder="Confirm your password" autoComplete="off" set={passwordConfirm} alert={alert.passwordConfirm}
                               onChange={checkPasswordConfirmField(password, passwordConfirm, alertRef, setAlert)}/>
                        <Button disabled={disableSubmit} onClick={handleSubmit} value="Reset Password"/>
                    </div>
                </div>
            )}
        </>
    )
}