import {useContext, useEffect} from 'react'
import {QueueContext} from '@/contexts/queue'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import {TooltipContext} from '@/contexts/tooltip'
import SidePanel from '@/components/side-panel'
import QueuePanel from '@/components/queue-panel'
import NavigationBar from '@/components/navigation-bar'
import NowPlayingBar from '@/components/now-playing-bar'
import styles from '@/styles/general.module.sass'

export default function Main({children}) {
    const {showQueuePanel} = useContext(QueueContext) // Get showQueuePanel function from QueueContext
    const [, , menuRef, showMenu, setShowMenu] = useContext(NavigationBarContext) // Get account menu references from the navigation bar context
    const [, setTooltip] = useContext(TooltipContext) // Use tooltip context for resetting its value

    useEffect(() => {
        const handleClick = e => {
            setTooltip({ // Reset tooltip data
                title: '',
                show: false,
                x: 0,
                y: 0,
                transformOrigin: null,
            })
            if (showMenu.current && menuRef.current && !menuRef.current.parentNode.contains(e.target)) setShowMenu(false) // If the account menu is shown and the parent node of the account menu is not contains the event target, close the account menu
        }

        window.addEventListener('click', handleClick)

        return () => {
            window.removeEventListener('click', handleClick)
        }
    }, [])

    return (
        <>
            <div className={`${styles.main} ${showQueuePanel ? styles.queuePanelActive : ''}`}>
                <SidePanel/>
                <div className={styles.content}>
                    <NavigationBar/>
                    {children}
                </div>
                {showQueuePanel && (<QueuePanel/>)}
            </div>
            <NowPlayingBar/>
        </>
    )
}