import {useContext} from 'react'
import {useHistory} from '@/pages/_app'
import {AuthContext} from '@/contexts/auth'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import {ModalContext} from '@/contexts/modal'
import Link from '@/components/custom-link'
import LoginModal from '@/components/modals/login'
import SignupModal from '@/components/modals/signup'
import AskLoginModal from '@/components/modals/ask-login'
import {RGBtoString} from '@/utils/color-converter'
import {NextIcon, PrevIcon} from '@/icons'
import styles from '@/styles/navigation-bar.module.sass'

export default function NavigationBar() {
    const [user, setUser] = useContext(AuthContext) // Get user from auth context
    const [width, , menuRef, showMenu, setShowMenu] = useContext(NavigationBarContext) // Get navigation bar width from context
    const [modal, setModal] = useContext(ModalContext) // Use modal context
    const [goBack, goForward] = useHistory() // Get goBack and goForward functions from history hook

    const handleShowMenu = () => setShowMenu(!showMenu.current) // Toggle account menu

    const handleLogout = () => {
        localStorage.removeItem('token') // Remove token from local storage
        setUser({loaded: true}) // Flush user data in the auth context
        setModal({canClose: true, active: <AskLoginModal/>}) // Show ask login modal
        setShowMenu(false) // Close account menu
    }

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
                        <button className={styles.login} onClick={() => setModal({...modal, active: <LoginModal/>})}>
                            Log in
                        </button>
                        <button className={styles.signup} onClick={() => setModal({...modal, active: <SignupModal/>})}>
                            Sign up
                        </button>
                    </div>
                ) : user.loaded && user.id ? (
                    <div className={styles.user}>
                        <div className={styles.info} onClick={handleShowMenu}>
                            <div className={styles.image}
                                 style={!user.image && user.accentColor ? {backgroundColor: RGBtoString(user.accentColor)} : {}}>
                                {user.image ? <img src={`${process.env.IMAGE_CDN}/${user.image}`} alt={''}/> :
                                    <span style={!user.image && user.profileColor ? {color: RGBtoString(user.profileColor)} : {}}>{user?.name[0]?.toUpperCase()}</span>}
                            </div>
                            <div className={styles.name}>
                                {user.name}
                            </div>
                        </div>
                        <div className={`${styles.menu} ${showMenu.current ? styles.show : ''}`} ref={menuRef}>
                            <ul>
                                <li>
                                    <Link href="/account" onClick={() => setShowMenu(false)}>Account</Link>
                                </li>
                                <li>
                                    <Link href="/profile/[id]" as={`/profile/${user.id}`} onClick={() => setShowMenu(false)}>Profile</Link>
                                </li>
                                <li>
                                    <Link href="/" onClick={() => setShowMenu(false)}>Settings</Link>
                                </li>
                                <li className={styles.separator}></li>
                                <li>
                                    <span onClick={handleLogout}>Log out</span>
                                </li>
                                {user.admin ? (
                                    <li>
                                        <Link href={'/admin'} onClick={() => setShowMenu(false)}>Admin Panel</Link>
                                    </li>
                                ) : ''}
                            </ul>
                        </div>
                    </div>
                ) : ''}
            </div>
        </div>
    )
}