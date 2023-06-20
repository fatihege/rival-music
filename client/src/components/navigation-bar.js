import {useContext} from 'react'
import {useHistory} from '@/pages/_app'
import {AuthContext} from '@/contexts/auth'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import {NextIcon, PrevIcon} from '@/icons'
import styles from '@/styles/navigation-bar.module.sass'

export default function NavigationBar() {
    const [user] = useContext(AuthContext) // Get user from auth context
    const [width] = useContext(NavigationBarContext) // Get navigation bar width from context
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