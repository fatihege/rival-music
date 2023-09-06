import axios from 'axios'
import {useRouter} from 'next/router'
import Link from '@/components/link'
import Image from '@/components/image'
import {useCallback, useContext, useEffect, useRef, useState} from 'react'
import Skeleton from 'react-loading-skeleton'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import {LibraryContext} from '@/contexts/library'
import CustomScrollbar from '@/components/custom-scrollbar'
import PlaylistImage from '@/components/playlist-image'
import {TooltipHandler} from '@/components/tooltip'
import {AddIcon, AlbumDefault, HomeIcon, LibraryIcon, Logo, LogoIcon, PrevIcon, SearchIcon} from '@/icons'
import styles from '@/styles/side-panel.module.sass'

const MIN_WIDTH = 268, // Minimum width of the side panel
    DEFAULT_WIDTH = 320, // Default width of the side panel
    MAX_WIDTH = 598 // Maximum width of the side panel

export default function SidePanel() {
    const resizerRef = useRef() // Reference to the resizer element
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get user from AuthContext
    const [, setAlert] = useContext(AlertContext) // Use alert context for displaying alerts
    const [, setNavBarWidth] = useContext(NavigationBarContext) // Navigation bar width
    const [library, , getUserLibrary] = useContext(LibraryContext) // Get user library
    const [activeLink, setActiveLink] = useState(router.pathname || '/') // Active link
    const [isResizing, setIsResizing] = useState(false) // Is resizing active
    const [offset, setOffset] = useState(0) // Offset of mouse from layout resizer
    const [width, _setWidth] = useState(DEFAULT_WIDTH) // Width of the side panel
    const [isMinimized, setIsMinimized] = useState(false) // Is side panel minimized
    const widthRef = useRef(width) // Reference to the width of the side panel
    const links = [ // Links
        {
            href: '/',
            icon: <HomeIcon/>,
            activeIcon: <HomeIcon fill={process.env.ACCENT_COLOR} stroke={process.env.ACCENT_COLOR}/>,
            label: 'Home',
        },
        {
            href: '/explore',
            icon: <SearchIcon/>,
            activeIcon: <SearchIcon fill={process.env.ACCENT_COLOR} stroke={process.env.ACCENT_COLOR}/>,
            label: 'Explore',
        },
    ]

    const setWidth = value => { // Set width of the side panel
        widthRef.current = value
        _setWidth(value)
        updateNavBarWidth(value, isMinimized) // Update navigation bar width
    }

    const updateNavBarWidth = (value, isMinimized) => {
        if (isMinimized) setNavBarWidth(window.innerWidth - 116)
        else setNavBarWidth(window.innerWidth - value - 12)
    }

    useEffect(() => {
        const width = localStorage.getItem('sidePanelWidth') // Get width from local storage
        if (width && !isNaN(parseInt(width))) // If width is valid
            if (parseInt(width) === -1) {
                setIsMinimized(true) // If width is -1, set is minimized
                updateNavBarWidth(-1, true) // Update navigation bar width
            }
            else setWidth(parseInt(width)) // Otherwise, set width
        else setWidth(DEFAULT_WIDTH) // Otherwise, set default width

        const handleResize = () => {
            const width = localStorage.getItem('sidePanelWidth') // Get width from local storage
            if (width && !isNaN(parseInt(width))) // If width is valid
                if (parseInt(width) === -1) updateNavBarWidth(-1, true) // Update navigation bar width
                else updateNavBarWidth(parseInt(width))
        }

        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        setActiveLink(router.pathname) // Update active link
    }, [router.pathname]) // On route change

    useEffect(() => {
        if (!user?.loaded || !user?.id || !user?.token) return // If user is not logged in, return
        if (router.asPath === `/profile/${user?.id}`) return // If route is profile, return
        getUserLibrary()
    }, [user])

    const handleResizeDown = useCallback(e => {
        setIsResizing(true) // Set resizing to true
        setOffset(isMinimized ? 0 : widthRef.current - e.clientX) // Set offset to current width minus mouse position
    }, [isMinimized]) // Handle resizing down

    const handleResizeUp = useCallback(e => {
        if (!isResizing) return
        e.preventDefault()
        e.stopPropagation()
        setIsResizing(false) // Set resizing to false
    }, [isResizing]) // Handle resizing down

    const handleResize = useCallback(e => {
        if (!isResizing) return // If resizing is not active, return

        e.preventDefault()
        e.stopPropagation()

        const newWidth = e.clientX + offset // Calculate new width of side panel

        if (newWidth < MIN_WIDTH / 2 - 10) { // If new width is less than break point
            setIsMinimized(true) // Set side panel to minimized
            if (offset !== 0) setOffset(0) // Set offset to 0
        } else { // Otherwise
            setWidth(newWidth) // Set width of side panel to new width

            if (isMinimized) { // If side panel is minimized
                setIsMinimized(false) // Set side panel to not minimized
                setOffset(widthRef.current - e.clientX) // Set offset to current width minus mouse position
            }
        }

        if (isMinimized && newWidth > MIN_WIDTH / 2 + 10) setWidth(Math.max(Math.min(newWidth, MAX_WIDTH), MIN_WIDTH)) // If new width is greater than break point and side panel is minimized, maximize side panel

        setWidth(Math.max(Math.min(newWidth, MAX_WIDTH), MIN_WIDTH)) // Set width of side panel
        localStorage.setItem('sidePanelWidth', (isMinimized ? -1 : widthRef.current).toString()) // Save width to local storage
    }, [isResizing, isMinimized])

    useEffect(() => {
        document.addEventListener('mousemove', handleResize)
        document.addEventListener('mouseup', handleResizeUp)
        document.addEventListener('mouseleave', handleResizeUp)

        return () => { // Remove event listeners for resizing
            document.removeEventListener('mousemove', handleResize)
            document.removeEventListener('mouseup', handleResizeUp)
            document.removeEventListener('mouseleave', handleResizeUp)
        }
    }, [handleResize, handleResizeUp]) // Add event listeners for resizing

    const handleMinimize = (maximize = false) => {
        if (!maximize) { // If minimize
            setIsMinimized(true) // Minimize side panel
            updateNavBarWidth(-1, true) // Update navigation bar width
            localStorage.setItem('sidePanelWidth', '-1') // Save width to local storage
        } else { // If maximize
            setIsMinimized(false) // Maximize side panel
            localStorage.setItem('sidePanelWidth', widthRef.current.toString()) // Save width to local storage
        }
    }

    const handleCreatePlaylist = () => {
        axios.post(`${process.env.API_URL}/playlist/create`, {}, { // Create playlist
            headers: {
                Authorization: `Bearer ${user?.token}`,
            }
        }).then(res => {
            if (res.data?.status === 'OK') {
                getUserLibrary() // Update user library
                router.push('/playlist/[id]', `/playlist/${res.data?.id}`) // Redirect to playlist page
            }
        }).catch(e => {
            console.error(e)
            setAlert({
                active: true,
                title: 'An error occurred',
                description: 'An error occurred while creating the playlist',
                button: 'OK',
                type: '',
            })
        })
    }

    return (
        <>
            <div className={`${styles.sidePanel} ${isMinimized ? styles.minimized : ''} ${!user?.loaded || !user?.id || !user?.token ? styles.notLoggedIn : ''}`}
                 style={!isMinimized ? {width: `${Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH)}px`} : {}}>
                <div className={`${styles.section} ${styles.linksSection}`}>
                    <div className={styles.logo}>
                        <Link href="/" className={styles.logoLink}>
                            {isMinimized ? <LogoIcon/> : <Logo/>}
                        </Link>
                    </div>
                    {links.map(({href, icon, activeIcon, label}, index) => (
                            <Link href={href} className={`${styles.link} ${activeLink === href ? styles.active : ''}`}
                                      key={index}>
                                <div className={styles.icon}>
                                    {activeLink === href ? activeIcon : icon}
                                </div>
                                {!isMinimized && (
                                    <div className={styles.label}>
                                        {label}
                                    </div>
                                )}
                            </Link>
                        )
                    )}
                </div>
                {user?.loaded && user?.id && user?.token ? (
                    <div className={`${styles.section} ${styles.librarySection}`}>
                        <div className={styles.header}>
                            <Link href={'/library'} className={`${styles.link} ${activeLink === '/library' ? styles.active : ''}`}>
                                <div className={styles.icon}>
                                    {activeLink === '/library' ? (
                                        <LibraryIcon filled={true} fill={process.env.ACCENT_COLOR} stroke={process.env.ACCENT_COLOR}/>
                                    ) : (
                                        <LibraryIcon/>
                                    )}
                                </div>
                                {!isMinimized && (
                                    <div className={styles.label}>
                                        Your Library
                                    </div>
                                )}
                            </Link>
                            {!isMinimized && (
                                <div className={styles.operations}>
                                    <TooltipHandler title={'Create playlist'}>
                                        <button onClick={handleCreatePlaylist}>
                                            <AddIcon strokeRate={1.2} stroke={'#aeaeae'}/>
                                        </button>
                                    </TooltipHandler>
                                    <TooltipHandler title={!isMinimized ? 'Minimize side panel' : ''}>
                                        <button onClick={() => handleMinimize()}>
                                            <PrevIcon strokeRate={1.2} stroke={'#aeaeae'}/>
                                        </button>
                                    </TooltipHandler>
                                </div>
                            )}
                        </div>
                        <CustomScrollbar>
                            <div className={styles.libraryList}>
                                {library ? (
                                    <>
                                        {library?.playlists?.map(item => (
                                            <Link href={'/playlist/[id]'} as={`/playlist/${item?.id || item?._id}`}
                                                  key={item?.id || item?._id}>
                                                <div className={styles.listItem}>
                                                    <div className={styles.image}>
                                                        <PlaylistImage playlist={item} width={48} height={48}/>
                                                    </div>
                                                    {!isMinimized && (
                                                        <div className={styles.info}>
                                                            <div className={styles.name}>
                                                                {item?.title}
                                                            </div>
                                                            <div className={styles.creator}>
                                                                {item?.owner?.name}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                        {library?.likedPlaylists?.map(item => (
                                            <Link href={'/playlist/[id]'} as={`/playlist/${item?.id || item?._id}`}
                                                  key={item?.id || item?._id}>
                                                <div className={styles.listItem}>
                                                    <div className={styles.image}>
                                                        <PlaylistImage playlist={item} width={48} height={48}/>
                                                    </div>
                                                    {!isMinimized && (
                                                        <div className={styles.info}>
                                                            <div className={styles.name}>
                                                                {item?.title}
                                                            </div>
                                                            <div className={styles.creator}>
                                                                {item?.owner?.name}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                        {library?.albums?.map(item => (
                                            <Link href={'/album/[id]'} as={`/album/${item?.id || item?._id}`}
                                                  key={item?.id || item?._id}>
                                                <div className={styles.listItem}>
                                                    <div className={styles.image}>
                                                        <Image src={item?.cover} width={48} height={48} format={'webp'}
                                                               alt={item?.title} alternative={<AlbumDefault/>}
                                                               loading={<Skeleton width={48} height={48}
                                                                                  style={{top: '-2px'}}/>}/>
                                                    </div>
                                                    {!isMinimized && (
                                                        <div className={styles.info}>
                                                            <div className={styles.name}>
                                                                {item?.title}
                                                            </div>
                                                            <div className={styles.creator}>
                                                                {item?.artist?.name}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </>
                                    ) : (
                                    <>
                                        <Skeleton height={60} borderRadius={12}/>
                                        <Skeleton height={60} borderRadius={12}/>
                                        <Skeleton height={60} borderRadius={12}/>
                                    </>
                                )}
                            </div>
                        </CustomScrollbar>
                    </div>
                ) : ''}
                <div className={styles.layoutResizer} ref={resizerRef} onMouseDown={handleResizeDown}></div>
            </div>
        </>
    )
}