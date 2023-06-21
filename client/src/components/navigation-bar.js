import {useContext} from 'react'
import {useHistory} from '@/pages/_app'
import {AuthContext} from '@/contexts/auth'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import {ModalContext} from '@/contexts/modal'
import LoginModal from '@/components/modals/login'
import SignupModal from '@/components/modals/signup'
import {NextIcon, PrevIcon} from '@/icons'
import styles from '@/styles/navigation-bar.module.sass'

export default function NavigationBar() {
    const [user] = useContext(AuthContext) // Get user from auth context
    const [width] = useContext(NavigationBarContext) // Get navigation bar width from context
    const [modal, setModal] = useContext(ModalContext) // Use modal context
    const [goBack, goForward] = useHistory() // Get goBack and goForward functions from history hook

    return (
        <div className={styles.barContainer} style={{width: width ? `${width}px` : '100%'}}>
            <div className={styles.navButtons}>
                <button onClick={() => goBack()}>
                    <PrevIcon strokeRate={.75}/>
                </button>
                <button onClick={() => goForward()}>
                    <NextIcon strokeRate={.75}/>
                </button>
            </div>
            <div className={styles.accountSection}>
                {(user.loaded && !user.id) ? (
                    <div className={styles.buttons}>
                        <button className={styles.login} onClick={() => setModal({...modal, active: <LoginModal/>})}>Log in</button>
                        <button className={styles.signup} onClick={() => setModal({...modal, active: <SignupModal/>})}>Sign up</button>
                    </div>
                ) : user.loaded && user.id ? (
                    <div className={styles.user}>
                        {!user.image ? (
                            <div className={styles.pseudoImage}>{user?.name[0]?.toUpperCase()}</div>
                        ) : ''}
                        <div className={styles.name}>
                            {user.name}
                        </div>
                    </div>
                ) : ''}
            </div>
        </div>
    )
}