import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {ModalContext} from '@/contexts/modal'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import LoginModal from '@/components/modals/login'
import {LogoIcon, NextIcon} from '@/icons'
import checkEmail from '@/utils/check-email'
import styles from '@/styles/modals.module.sass'

export default function SignupModal() {
    const [, setUser] = useContext(AuthContext) // Use auth context
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

    const checkName = () => {
        if (!name.current.length) return setAlert({...alertRef.current, name: null}) // If name field is empty, remove name alert

        if (name.current.trim()?.length < 4) setAlert({...alertRef.current, name: 'The name you entered is too short.'}) // If length of name is less than 4, update name alert
        else setAlert({...alertRef.current, name: null}) // Otherwise, remove name alert
    }

    const checkEmailField = () => {
        if (!email.current.length) return setAlert({...alertRef.current, email: null}) // If email field is empty, remove email alert

        if (!checkEmail(email.current)) setAlert({ // If email is not matches with valid pattern
            ...alertRef.current,
            email: 'The email address you entered is invalid.' // Update email alert
        })
        else setAlert({...alertRef.current, email: null}) // Otherwise, remove email alert
    }

    const checkPassword = () => {
        if (!password.current.length) return setAlert({...alertRef.current, password: null}) // If password field is empty, remove password alert

        if (password.current.length < 6) setAlert({...alertRef.current, password: 'Your password is too short.'}) // If length of password is less than 6, update password alert
        else setAlert({...alertRef.current, password: null}) // Otherwise, remove password alert

        checkPasswordConfirm() // Check for password confirmation field
    }

    const checkPasswordConfirm = () => {
        if (!passwordConfirm.current.length) return setAlert({...alertRef.current, passwordConfirm: null}) // If password confirmation field is empty, remove password confirmation alert

        if (password.current !== passwordConfirm.current) setAlert({ // If value of password and password confirmation field is not equal
            ...alertRef.current,
            passwordConfirm: 'The passwords you entered do not match.' // Update password confirmation alert
        })
        else setAlert({...alertRef.current, passwordConfirm: null}) // Otherwise, remove password confirmation alert
    }

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
                setUser(response.data.user) // Update user from auth context
                setModal({...modal, canClose: true, active: null}) // Enable modal closure and close modal
            }
        } catch (e) {
            if (e.response && e.response.data.errors && Array.isArray(e.response.data.errors) && e.response.data.errors.length) // If the error from axios response
                for (const error of e.response.data.errors) setAlert({ // Update alerts
                    ...alertRef.current,
                    [error.field]: error.message
                })
            else {
                window.alert('An error occurred while creating your account. Try again later or contact with site owner.') // Otherwise, show an alert
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
                    <Input type="text" placeholder="What's your name" name="name" className={styles.input}
                           autoComplete="off" set={name} alert={alert.name} onBlur={checkName}/>
                    <Input type="text" placeholder="Your email" name="email" className={styles.input} autoComplete="off"
                           set={email} alert={alert.email} onBlur={checkEmailField}/>
                    <Input type="password" placeholder="Create a password" name="password" className={styles.input}
                           autoComplete="off" set={password} alert={alert.password} onChange={checkPassword}/>
                    <Input type="password" placeholder="Confirm your password" name="password" className={styles.input}
                           autoComplete="off" set={passwordConfirm} alert={alert.passwordConfirm}
                           onChange={checkPasswordConfirm}/>
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