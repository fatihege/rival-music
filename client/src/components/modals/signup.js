import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {ModalContext} from '@/contexts/modal'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import LoginModal from '@/components/modals/login'
import {LogoIcon, NextIcon} from '@/icons'
import styles from '@/styles/modals.module.sass'
import {checkNameField, checkEmailField, checkPasswordField, checkPasswordConfirmField} from '@/utils/checkers'

export default function SignupModal() {
    const [, setUser] = useContext(AuthContext) // Use auth context
    const [, setAlertPopup] = useContext(AlertContext) // Use alert context
    const [modal, setModal] = useContext(ModalContext) // Use modal context
    const name = useRef('') // Name value reference
    const email = useRef('') // Email value reference
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
        if (alertRef.current.name || alertRef.current.email || alertRef.current.password || alertRef.current.passwordConfirm || !name.current.trim().length ||
            !email.current.trim().length || !password.current.length || !passwordConfirm.current.length) // If alerts is not empty or inputs are empty
            setDisableSubmit(true) // Disable submit button
        else setDisableSubmit(false) // Otherwise, enable submit button
    }, [alertRef.current])

    const handleSubmit = async () => {
        if (alertRef.current.name || alertRef.current.email || alertRef.current.password || alertRef.current.passwordConfirm || !modal.canClose) return // If there is an alert or modal is cannot close, return
        setModal({...modal, canClose: false}) // Disable modal closure

        try {
            const response = await axios.post(`${process.env.API_URL}/user/signup`, { // Send POST request for register with input data
                name: name.current,
                email: email.current,
                password: password.current,
                passwordConfirm: passwordConfirm.current,
            })

            if (response.data?.status === 'OK') { // If response is OK
                setUser({loaded: true, ...response.data.user}) // Update user from auth context
                setModal({...modal, canClose: true, active: null}) // Enable modal closure and close modal
            } else throw new Error()
        } catch (e) {
            if (e.response && e.response.data.errors && Array.isArray(e.response.data.errors) && e.response.data.errors.length) // If there is an error from axios response
                for (const error of e.response.data.errors) setAlert({ // Update alerts
                    ...alertRef.current,
                    [error.field]: error.message
                })
            else {
                setAlertPopup({ // Otherwise, show an alert
                    active: true,
                    title: 'We are sorry',
                    description: 'An error occurred while creating your account. Try again later or contact with site owner.',
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
            <h3 className={styles.title}>Create your Rival Account</h3>
            <p className={styles.description}>Let's start a journey full of music!</p>
            <div className={styles.form}>
                <div className={styles.inputGroup}>
                    <Input type="text" placeholder="What's your name" className={styles.input} autoComplete="off" set={name}
                           alert={alert.name} onChange={checkNameField(name, alertRef, setAlert)}/>
                    <Input type="text" placeholder="Your email" className={styles.input} autoComplete="off" set={email}
                           alert={alert.email} onChange={checkEmailField(email, alertRef, setAlert)}/>
                    <Input type="password" placeholder="Create a password" className={styles.input} autoComplete="off" set={password}
                           alert={alert.password} onChange={checkPasswordField(password, passwordConfirm, alertRef, setAlert)}/>
                    <Input type="password" placeholder="Confirm your password" className={styles.input} autoComplete="off" set={passwordConfirm}
                           alert={alert.passwordConfirm} onChange={checkPasswordConfirmField(password, passwordConfirm, alertRef, setAlert)}/>
                </div>
                <Button value="Sign up" icon={<NextIcon stroke={'#1c1c1c'}/>} onClick={handleSubmit}
                        disabled={disableSubmit ? disableSubmit : !modal.canClose}/>
            </div>
            <div className={styles.extras}>
                <span onClick={() => modal.canClose ? setModal({...modal, active: <LoginModal/>}) : false}>Log in to your account</span>
            </div>
        </div>
    )
}