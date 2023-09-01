import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {ModalContext} from '@/contexts/modal'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import LoginModal from '@/components/modals/login'
import SignupModal from '@/components/modals/signup'
import {LogoIcon, NextIcon} from '@/icons'
import checkEmail from '@/utils/check-email'
import styles from '@/styles/modals.module.sass'

export default function ForgotPasswordModal() {
    const [, setUser] = useContext(AuthContext) // Use auth context
    const [, setAlertPopup] = useContext(AlertContext) // Use alert context
    const [modal, setModal] = useContext(ModalContext) // Use modal context
    const email = useRef('') // Email value reference
    const [disableSubmit, setDisableSubmit] = useState(false) // Is submit button disabled
    const [alert, _setAlert] = useState({ // Alert state
        email: null,
    })
    const alertRef = useRef(alert) // Alert state reference

    const setAlert = value => { // Set alert state and reference value
        alertRef.current = value
        _setAlert(value)
    }

    useEffect(() => { // When alerts changed
        if (alertRef.current.email || !email.current.trim().length) // If alerts is not empty or inputs are empty
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

    const handleSubmit = async () => {
        if (alert.email || !modal.canClose) return // If there is an alert or modal is cannot close, return
        setModal({...modal, canClose: false}) // Disable modal closure

        try {
            const response = await axios.post(`${process.env.API_URL}/user/forgot-password`, { // Send POST request for
                email: email.current,
            })

            if (response.data?.status === 'OK') { // If response is OK
                setAlertPopup({ // Show an alert
                    active: true,
                    title: 'Password reset link sent',
                    description: 'We sent you a link to reset your password. Please check your email address.',
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
            else if (e?.response?.data?.status === 'NOT_ACCEPTED') // If there is NOT_ACCEPTED error
                setAlertPopup({ // Show an alert
                    active: true,
                    title: 'Account not accepted',
                    description: 'Your account is not accepted by the site owner. Please wait while your account is accepted.',
                    button: 'OK',
                    type: '',
                })
            else if (e?.response?.data?.status === 'NOT_ACTIVATED') // If there is NOT_ACTIVATED error
                setAlertPopup({ // Show an alert
                    active: true,
                    title: 'Account not activated',
                    description: 'You must activate your account to use the app. We sent you an activation link to your email address.',
                    button: 'OK',
                    type: '',
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
            <h3 className={styles.title}>Reset Your Password</h3>
            <p className={styles.description}>Enter your email address below and we'll send you a link to reset your password.</p>
            <div className={styles.form}>
                <div className={styles.inputGroup}>
                    <Input type="text" placeholder="Your email" className={styles.input} autoComplete="off"
                           set={email} alert={alert.email} onChange={checkEmailField}/>
                </div>
                <Button value="Send reset link" icon={<NextIcon stroke={'#1c1c1c'}/>} onClick={handleSubmit}
                        disabled={disableSubmit ? disableSubmit : !modal.canClose}/>
            </div>
            <div className={styles.extras}>
                <span onClick={() => modal.canClose ? setModal({...modal, active: <LoginModal/>}) : false}>Back to login</span>
                <span onClick={() => modal.canClose ? setModal({...modal, active: <SignupModal/>}) : false}>Create new account</span>
            </div>
        </div>
    )
}