import {useContext} from 'react'
import {ModalContext} from '@/contexts/modal'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import LoginModal from '@/components/modals/login'
import {LogoIcon, NextIcon} from '@/icons'
import styles from '@/styles/modals.module.sass'

export default function SignupModal() {
    const [, setModal] = useContext(ModalContext) // Use modal context

    return (
        <div className={styles.loginModal}>
            <div className={styles.logo}>
                <LogoIcon/>
            </div>
            <h3 className={styles.title}>Create your Rival Account</h3>
            <p className={styles.description}>Let's start a journey full of music!</p>
            <div className={styles.form}>
                <div className={styles.inputGroup}>
                    <Input type="text" placeholder="What's your name" name="name" className={styles.input} autoComplete="off"/>
                    <Input type="text" placeholder="Your email" name="email" className={styles.input} autoComplete="off"/>
                    <Input type="password" placeholder="Create a password" name="password" className={styles.input} autoComplete="off"/>
                    <Input type="password" placeholder="Confirm your password" name="password" className={styles.input} autoComplete="off"/>
                </div>
                <Button value="Sign up" icon={<NextIcon stroke={'#1c1c1c'}/>}/>
            </div>
            <div className={styles.extras}>
                <span onClick={() => setModal(<LoginModal/>)}>Log in your account</span>
            </div>
        </div>
    )
}