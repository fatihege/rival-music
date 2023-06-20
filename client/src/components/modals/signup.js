import {useContext, useState} from 'react'
import {ModalContext} from '@/contexts/modal'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import LoginModal from '@/components/modals/login'
import {LogoIcon, NextIcon} from '@/icons'
import styles from '@/styles/modals.module.sass'

export default function SignupModal() {
    const [, setModal] = useContext(ModalContext) // Use modal context
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [alert, setAlert] = useState({
        name: null,
        email: null,
        password: null,
        passwordConfirm: null,
    })

    const handleSubmit = () => {
        // TODO: Process form
    }

    const checkName = () => {
        if (!name.length) return setAlert({...alert, name: null})

        if (name.trim()?.length < 4) setAlert({...alert, name: 'The name you entered is too short.'})
        else setAlert({...alert, name: null})
    }

    const checkEmail = () => {
        if (!email.length) return setAlert({...alert, email: null})

        if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) setAlert({...alert, email: 'The email address you entered is invalid.'})
        else setAlert({...alert, email: null})
    }

    const checkPassword = password => {
        if (!password.length) return setAlert({...alert, password: null})

        if (password.length < 6) setAlert({...alert, password: 'Your password is too short.'})
        else setAlert({...alert, password: null})

    }

    const checkPasswordConfirm = passwordConfirm => {
        if (!passwordConfirm.length) return setAlert({...alert, passwordConfirm: null})

        if (password !== passwordConfirm) setAlert({...alert, passwordConfirm: 'The passwords you entered do not match.'})
        else setAlert({...alert, passwordConfirm: null})
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
                           autoComplete="off" set={setName} alert={alert.name} onBlur={checkName}/>
                    <Input type="text" placeholder="Your email" name="email" className={styles.input} autoComplete="off"
                           set={setEmail} alert={alert.email} onBlur={checkEmail}/>
                    <Input type="password" placeholder="Create a password" name="password" className={styles.input}
                           autoComplete="off" set={setPassword} alert={alert.password} onChange={checkPassword}/>
                    <Input type="password" placeholder="Confirm your password" name="password" className={styles.input}
                           autoComplete="off" set={setPasswordConfirm} alert={alert.passwordConfirm} onChange={checkPasswordConfirm}/>
                </div>
                <Button value="Sign up" icon={<NextIcon stroke={'#1c1c1c'}/>} onClick={handleSubmit}/>
            </div>
            <div className={styles.extras}>
                <span onClick={() => setModal(<LoginModal/>)}>Log in to your account</span>
            </div>
        </div>
    )
}