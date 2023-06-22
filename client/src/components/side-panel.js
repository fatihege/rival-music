import {useRouter} from 'next/router'
import Link from '@/components/custom-link'
import {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import CustomScrollbar from '@/components/custom-scrollbar'
import {AddIcon, HomeIcon, LibraryIcon, Logo, LogoIcon, PrevIcon, SearchIcon} from '@/icons'
import styles from '@/styles/side-panel.module.sass'

const MIN_WIDTH = 298, // Minimum width of the side panel
    DEFAULT_WIDTH = 320, // Default width of the side panel
    MAX_WIDTH = 598 // Maximum width of the side panel

const ACCENT_COLOR = '#00ff78'

export default function SidePanel() {
    const resizerRef = useRef() // Reference to the resizer element
    const router = useRouter() // Router instance
    const [, setNavBarWidth] = useContext(NavigationBarContext)
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
            activeIcon: <HomeIcon filled={true} fill={ACCENT_COLOR} stroke={ACCENT_COLOR}/>,
            label: 'Home',
        },
        {
            href: '/explore',
            icon: <SearchIcon/>,
            activeIcon: <SearchIcon filled={true} fill={ACCENT_COLOR} stroke={ACCENT_COLOR}/>,
            label: 'Explore',
        },
    ]
    const [libraryItems, setLibraryItems] = useState([]) // Library items

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
        if (!libraryItems.length) // Add library items if not added
            for (let id = 1; id <= 6; id++) setLibraryItems(prevState => [...prevState, {
                id: id,
                name: id === 6 ? 'Ride The Lightning' : id === 5 ? 'Fear of the Dark (2015 Remaster)' : id === 4 ? 'Hells Bells' : id === 3 ? 'The Devil in I' : id === 2 ? 'Heaven and Hell - 2009 Remaster' : 'Seek & Destroy - Remastered',
                artist: id === 5 ? 'Iron Maiden' : id === 4 ? 'AC/DC' : id === 3 ? 'Slipknot' : id === 2 ? 'Black Sabbath' : 'Metallica',
                image: id === 6 ? '/album_cover_6.jpg' : id === 5 ? '/album_cover_5.jpg' : id === 4 ? '/album_cover_4.jpg' : id === 3 ? '/album_cover_3.jpg' : id === 2 ? '/album_cover_2.jpg' : '/album_cover_1.jpg',
            }])

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
        localStorage.setItem('sidePanelWidth', isMinimized ? -1 : widthRef.current) // Save width to local storage
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
            localStorage.setItem('sidePanelWidth', -1) // Save width to local storage
        } else { // If maximize
            setIsMinimized(false) // Maximize side panel
            localStorage.setItem('sidePanelWidth', widthRef.current) // Save width to local storage
        }
    }

    return (
        <>
            <div className={`${styles.sidePanel} ${isMinimized ? styles.minimized : ''}`}
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
                <div className={`${styles.section} ${styles.librarySection}`}>
                    <div className={styles.header}>
                        <Link href="/library" className={`${styles.link} ${activeLink === '/library' ? styles.active : ''}`}>
                            <div className={styles.icon}>
                                {activeLink === '/library' ? (
                                    <LibraryIcon filled={true} fill={ACCENT_COLOR} stroke={ACCENT_COLOR}/>
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
                                <button>
                                    <AddIcon strokeRate={1.2} stroke="#aeaeae"/>
                                </button>
                                <button onClick={() => handleMinimize()}>
                                    <PrevIcon strokeWidth={24} stroke="#aeaeae"/>
                                </button>
                            </div>
                        )}
                    </div>
                    <CustomScrollbar>
                        <div className={styles.libraryList}>
                            {libraryItems.map(({id, name, artist, image}) => (
                                <Link href="/" key={id}>
                                    <div className={styles.listItem}>
                                        <div className={styles.image}>
                                            <img src={image} alt={name}/>
                                        </div>
                                        {!isMinimized && (
                                            <div className={styles.info}>
                                                <div className={styles.name}>
                                                    {name}
                                                </div>
                                                <div className={styles.creator}>
                                                    {artist}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CustomScrollbar>
                </div>
                <div className={styles.layoutResizer} ref={resizerRef} onMouseDown={handleResizeDown}></div>
            </div>
        </>
    )
}