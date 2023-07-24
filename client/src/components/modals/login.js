import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {ModalContext} from '@/contexts/modal'
import Link from '@/components/custom-link'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import SignupModal from '@/components/modals/signup'
import {LogoIcon, NextIcon} from '@/icons'
import checkEmail from '@/utils/check-email'
import styles from '@/styles/modals.module.sass'

export default function LoginModal() {
    const [, setUser] = useContext(AuthContext) // Use auth context
    const [, setAlertPopup] = useContext(AlertContext) // Use alert context
    const [modal, setModal] = useContext(ModalContext) // Use modal context
    const email = useRef('') // Email value reference
    const password = useRef('') // Password value reference
    const [disableSubmit, setDisableSubmit] = useState(false) // Is submit button disabled
    const [alert, _setAlert] = useState({ // Alert state
        email: null,
        password: null,
    })
    const alertRef = useRef(alert) // Alert state reference

    const setAlert = value => { // Set alert state and reference value
        alertRef.current = value
        _setAlert(value)
    }

    useEffect(() => { // When alerts changed
        if (alertRef.current.email || alertRef.current.password || !email.current.trim().length || !password.current.length) // If alerts is not empty or inputs are empty
            setDisableSubmit(true) // Disable submit button
        else setDisableSubmit(false) // Otherwise, enable submit button
    }, [alertRef.current])

    const checkEmailField = () => {
        if (!email.current) return setAlert({...alertRef.current, email: null}) // If email field is empty, remove email alert

        if (!checkEmail(email.current)) setAlert({ // If email is not matches with valid pattern
            ...alertRef.current,
            email: 'The email address you entered is invalid.' // Update email alert
        })
        else setAlert({...alertRef.current, email: null}) // Otherwise, remove email alert
    }

    const checkPassword = () => setAlert({...alertRef.current, password: null}) // If password field is changed, remove password alert

    const handleSubmit = async () => {
        if (alert.email || alert.password || !modal.canClose) return // If there is an alert or modal is cannot close, return
        setModal({...modal, canClose: false}) // Disable modal closure

        try {
            const response = await axios.post(`${process.env.API_URL}/user/login`, { // Send POST request for login with input data
                email: email.current,
                password: password.current,
            })

            if (response.data?.status === 'OK') { // If response is OK
                setUser({loaded: true, ...response.data.user}) // Update user from auth context
                setModal({...modal, canClose: true, active: null}) // Enable modal closure and close modal
            } else throw new Error()
        } catch (e) { // If there is an error
            if (e.response && e.response.data.errors && Array.isArray(e.response.data.errors) && e.response.data.errors.length) // If there is an error from axios response
                for (const error of e.response.data.errors) setAlert({ // Update alerts
                    ...alertRef.current,
                    [error.field]: error.message
                })
            else {
                setAlertPopup({ // Otherwise, show an alert
                    active: true,
                    title: 'We are sorry',
                    description: 'An error occurred while logging into your account. Try again later or contact with site owner.',
                    button: 'OK',
                    type: ''
                })
                console.error(e)
            }

            setModal({...modal, canClose: true}) // Enable modal closure
        }
    }

    return (
        <div className={styles.formModal}>
            <div className={styles.logo}>
                <LogoIcon/>
            </div>
            <h3 className={styles.title}>Log in to Rival Account</h3>
            <p className={styles.description}>Are you ready to explore your own music world?</p>
            <div className={styles.form}>
                <div className={styles.inputGroup}>
                    <Input type="text" placeholder="Your email" className={styles.input} autoComplete="off"
                           set={email} alert={alert.email} onChange={checkEmailField}/>
                    <Input type="password" placeholder="Your password" className={styles.input} autoComplete="off"
                           set={password} alert={alert.password} onChange={checkPassword}/>
                </div>
                <Button value="Sign in" icon={<NextIcon stroke={'#1c1c1c'}/>} onClick={handleSubmit}
                        disabled={disableSubmit ? disableSubmit : !modal.canClose}/>
            </div>
            <div className={styles.extras}>
                <span onClick={() => modal.canClose ? setModal({...modal, active: <SignupModal/>}) : false}>Create new account</span>
                <Link href="/">Forgot your password?</Link>
            </div>
        </div>
    )
}