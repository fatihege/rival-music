import {useContext, useState} from 'react'
import {ModalContext} from '@/contexts/modal'
import Link from '@/components/custom-link'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import SignupModal from '@/components/modals/signup'
import {LogoIcon, NextIcon} from '@/icons'
import styles from '@/styles/modals.module.sass'

export default function LoginModal() {
    const [, setModal] = useContext(ModalContext)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [alert, setAlert] = useState({
        email: null,
    })

    const checkEmail = () => {
        if (!email.length) return setAlert({...alert, email: null})

        if (!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) setAlert({
            ...alert,
            email: 'The email address you entered is invalid.'
        })
        else setAlert({...alert, email: null})
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
                    <Input type="text" placeholder="Your email" name="email" className={styles.input} autoComplete="off"
                           set={setEmail} alert={alert.email} onBlur={checkEmail}/>
                    <Input type="password" placeholder="Your password" name="password" className={styles.input}
                           autoComplete="off" set={setPassword}/>
                </div>
                <Button value="Sign in" icon={<NextIcon stroke={'#1c1c1c'}/>}/>
            </div>
            <div className={styles.extras}>
                <span onClick={() => setModal(<SignupModal/>)}>Create new account</span>
                <Link href="/">Forgot your password?</Link>
            </div>
        </div>
    )
}