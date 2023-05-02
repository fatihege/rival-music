import Link from 'next/link'
import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import SpanLink from '@/components/span-link'
import {SidePanelResizingContext} from '@/pages/_app'
import {AddIcon, HomeIcon, LibraryIcon, LogoWhite, NextIcon, SearchIcon} from '@/icons'
import styles from '@/styles/side-panel.module.sass'

const MIN_WIDTH = 298, // Minimum width of the side panel
    DEFAULT_WIDTH = 320, // Default width of the side panel
    MAX_WIDTH = 600 // Maximum width of the side panel

export default function SidePanel() {
    const resizerRef = useRef() // Reference to the resizer element
    const router = useRouter() // Router instance
    const [activeLink, setActiveLink] = useState(router.pathname || '/') // Active link
    const [, setIsResizing] = useContext(SidePanelResizingContext) // Resizing context
    const [width, _setWidth] = useState(DEFAULT_WIDTH) // Width of the side panel
    const widthRef = useRef(width) // Reference to the width of the side panel
    const links = [ // Links
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
    ]

    const setWidth = value => { // Set width of the side panel
        widthRef.current = value
        _setWidth(value)
    }

    // TODO: Remove this
    let ran = false
    useEffect(() => {
        if (ran) return
        ran = true

        const width = localStorage.getItem('sidePanelWidth') // Get width from local storage
        if (width) setWidth(width) // Set width
    })

    useEffect(() => {
        setActiveLink(router.pathname) // Update active link
    }, [router.pathname])

    const handleResize = e => setIsResizing({ // Handle resizing
        active: true, // Set resizing to active
        MAX_WIDTH, // Set maximum width
        MIN_WIDTH, // Set minimum width
        offset: widthRef.current - e.clientX, // Set offset
        setWidth: value => {
            setWidth(value) // Set width
            localStorage.setItem('sidePanelWidth', value) // Save width to local storage
        }, // Pass setWidth function
    })

    return (
        <>
            <div className={styles.sidePanel} style={{width: `${Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH)}px`}}>
                <div className={`${styles.section} ${styles.linksSection}`}>
                    <div className={styles.logo}>
                        <SpanLink href="/" className={styles.logoLink}>
                            <LogoWhite/>
                        </SpanLink>
                    </div>
                    {links.map(({href, icon, activeIcon, label}, index) => (
                            <SpanLink href={href} className={`${styles.link} ${activeLink === href ? styles.active : ''}`} key={index}>
                                <div className={styles.icon}>
                                    {activeLink === href ? activeIcon : icon}
                                </div>
                                <div className={styles.label}>
                                    {label}
                                </div>
                            </SpanLink>
                        )
                    )}
                </div>
                <div className={`${styles.section} ${styles.librarySection}`}>
                    <div className={styles.header}>
                        <SpanLink href="/library" className={`${styles.link} ${activeLink === '/library' ? styles.active : ''}`}>
                            <div className={styles.icon}>
                                <LibraryIcon filled={activeLink === '/library'}/>
                            </div>
                            <div className={styles.label}>
                                Your Library
                            </div>
                        </SpanLink>
                        <div className={styles.operations}>
                            <button>
                                <AddIcon strokeWidth={24} stroke="#aeaeae"/>
                            </button>
                            <button>
                                <NextIcon strokeWidth={24} stroke="#aeaeae"/>
                            </button>
                        </div>
                    </div>
                    <div className={styles.libraryList}>
                        <SpanLink href="/">
                            <div className={styles.listItem}>
                                <div className={styles.image}>
                                    <img src="/album_cover_1.jpg"/>
                                </div>
                                <div className={styles.info}>
                                    <div className={styles.name}>
                                        <Link href="/">Seek & Destroy - Remastered</Link>
                                    </div>
                                    <div className={styles.creator}>
                                        <Link href="/">Metallica</Link>
                                    </div>
                                </div>
                            </div>
                        </SpanLink>
                        <SpanLink href="/">
                            <div className={styles.listItem}>
                                <div className={styles.image}>
                                    <img src="/album_cover_2.jpg"/>
                                </div>
                                <div className={styles.info}>
                                    <div className={styles.name}>
                                        <Link href="/">Heaven and Hell - 2009 Remastered</Link>
                                    </div>
                                    <div className={styles.creator}>
                                        <Link href="/">Black Sabbath</Link>
                                    </div>
                                </div>
                            </div>
                        </SpanLink>
                        <SpanLink href="/">
                            <div className={styles.listItem}>
                                <div className={styles.image}>
                                    <img src="/album_cover_3.jpg"/>
                                </div>
                                <div className={styles.info}>
                                    <div className={styles.name}>
                                        <Link href="/">The Devil in I</Link>
                                    </div>
                                    <div className={styles.creator}>
                                        <Link href="/">Slipknot</Link>
                                    </div>
                                </div>
                            </div>
                        </SpanLink>
                    </div>
                </div>
                <div className={styles.layoutResizer} ref={resizerRef} onMouseDown={handleResize}></div>
            </div>
        </>
    )
}