import {useContext} from 'react'
import {useHistory} from '@/pages/_app'
import {AuthContext} from '@/contexts/auth'
import {NextIcon, PrevIcon} from '@/icons'
import styles from '@/styles/navigation-bar.module.sass'

export default function NavigationBar() {
    const [user] = useContext(AuthContext)
    const [goBack, goForward] = useHistory()

    return (
        <div className={styles.barContainer}>
            <div className={styles.navButtons}>
                <button onClick={() => goBack()}>
                    <PrevIcon strokeRate={.75}/>
                </button>
                <button onClick={() => goForward()}>
                    <NextIcon strokeRate={.75}/>
                </button>
            </div>
            <div className={styles.accountSection}>
                {!user ? (
                    <div className={styles.buttons}>
                        <button className={styles.login}>Log in</button>
                        <button className={styles.signup}>Sign up</button>
                    </div>
                ) : ''}
            </div>
        </div>
    )
}