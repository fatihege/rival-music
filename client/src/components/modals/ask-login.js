import {useContext} from 'react'
import {ModalContext} from '@/contexts/modal'
import Button from '@/components/form/button'
import LoginModal from '@/components/modals/login'
import SignupModal from '@/components/modals/signup'
import {AskLoginBackground, Logo} from '@/icons'
import styles from '@/styles/modals.module.sass'

export default function AskLoginModal() {
    const [, setModal] = useContext(ModalContext)

    return (
        <div className={styles.askLoginModal}>
            <div className={styles.backgroundImage}>
                <AskLoginBackground/>
            </div>
            <div className={styles.logo}>
                <Logo/>
            </div>
            <div className={styles.slogan}>
                Ready to explore? Dive into Rival.
            </div>
            <div className={styles.buttons}>
                <Button value="Log in" onClick={() => setModal({canClose: true, active: <LoginModal/>})}/>
                <Button value="Sign up" type="noBackground" onClick={() => setModal({canClose: true, active: <SignupModal/>})}/>
            </div>
        </div>
    )
}