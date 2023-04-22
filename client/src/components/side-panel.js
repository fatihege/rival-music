import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import Link from 'next/link'
import {SidePanelResizingContext} from '@/pages/_app'
import {AddIcon, HomeIcon, LibraryIcon, LikeIcon, LogoWhite, SearchIcon} from '@/icons'
import styles from '@/styles/side-panel.module.sass'

const MIN_WIDTH = 200,
    DEFAULT_WIDTH = 300,
    MAX_WIDTH = 400

export default function SidePanel() {
    const resizerRef = useRef()
    const router = useRouter()
    const [activeLink, setActiveLink] = useState(router.pathname || '/')
    const [_, setIsResizing] = useContext(SidePanelResizingContext)
    const [width, _setWidth] = useState(DEFAULT_WIDTH)
    const widthRef = useRef(width)
    const links = [
        {
            href: '/',
            icon: <HomeIcon/>,
            activeIcon: <HomeIcon filled={true}/>,
            label: 'Home',
        },
        {
            href: '/explore',
            icon: <SearchIcon/>,
            activeIcon: <SearchIcon filled={true}/>,
            label: 'Explore',
        },
        {
            href: '/library',
            icon: <LibraryIcon/>,
            activeIcon: <LibraryIcon filled={true}/>,
            label: 'Your Library',
        },
    ]

    const setWidth = value => {
        widthRef.current = value
        _setWidth(value)
    }

    useEffect(() => {
        setActiveLink(router.pathname)
    }, [router.pathname])

    const handleResize = () => setIsResizing({
        active: true,
        setWidth,
    })

    return (
        <>
            <div className={styles.sidePanel} style={{width: `${Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH)}px`}}>
                <div className={styles.logo}>
                    <Link href="/" className={styles.link}>
                        <LogoWhite/>
                    </Link>
                </div>
                <div className={styles.links}>
                    {links.map(({href, icon, activeIcon, label}, index) => (
                            <Link href={href} className={`${styles.link} ${activeLink === href ? styles.active : ''}`} key={index}>
                                <div className={styles.icon}>
                                    {activeLink === href ? activeIcon : icon}
                                </div>
                                <div className={styles.label}>
                                    {label}
                                </div>
                            </Link>
                        )
                    )}
                </div>
                <div className={styles.libraryLinks}>
                    <div className={`${styles.link} ${styles.createPlaylist}`}>
                        <div className={styles.icon}>
                            <AddIcon stroke="#1c1c1c" strokeWidth={34}/>
                        </div>
                        <div className={styles.label}>
                            Create Playlist
                        </div>
                    </div>
                    <Link href="/library/liked" className={`${styles.link} ${styles.likedSongs}`}>
                        <div className={styles.icon}>
                            <LikeIcon fill="#fff"/>
                        </div>
                        <div className={styles.label}>
                            Liked Songs
                        </div>
                    </Link>
                </div>
                <div className={styles.layoutResizer} ref={resizerRef} onMouseDown={handleResize}></div>
            </div>
        </>
    )
}