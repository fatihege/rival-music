import {useContext, useEffect} from 'react'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import SidePanel from '@/components/side-panel'
import NavigationBar from '@/components/navigation-bar'
import NowPlayingBar from '@/components/now-playing-bar'
import styles from '@/styles/general.module.sass'

export default function Main({children}) {
    const [, , menuRef, showMenu, setShowMenu] = useContext(NavigationBarContext) // Get account menu references from the navigation bar context

    useEffect(() => {
        const handleMenuClick = e => {
            if (showMenu.current && menuRef.current && !menuRef.current.parentNode.contains(e.target)) setShowMenu(false) // If the account menu is shown and the parent node of the account menu is not contains the event target, close the account menu
        }

        window.addEventListener('click', handleMenuClick)

        return () => {
            window.removeEventListener('click', handleMenuClick)
        }
    }, [])

    return (
        <>
            <div className={styles.main}>
                <SidePanel/>
                <div className={styles.content}>
                    <NavigationBar/>
                    {children}
                </div>
            </div>
            <NowPlayingBar/>
        </>
    )
}