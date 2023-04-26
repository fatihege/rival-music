import Link from 'next/link'
import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import SpanLink from '@/components/span-link'
import {SidePanelResizingContext} from '@/pages/_app'
import {AddIcon, HomeIcon, LibraryIcon, LogoWhite, NextIcon, SearchIcon} from '@/icons'
import getTabindex from '@/utils/get-tabindex'
import styles from '@/styles/side-panel.module.sass'

const MIN_WIDTH = 296,
    DEFAULT_WIDTH = 320,
    MAX_WIDTH = 600

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
    ]

    const setWidth = value => {
        widthRef.current = value
        _setWidth(value)
    }

    useEffect(() => {
        setActiveLink(router.pathname)
    }, [router.pathname])

    const handleResize = e => setIsResizing({
        active: true,
        MAX_WIDTH,
        MIN_WIDTH,
        offset: widthRef.current - e.clientX,
        setWidth,
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
                            <SpanLink href={href} className={`${styles.link} ${activeLink === href ? styles.active : ''}`} key={index} tabIndex={getTabindex()}>
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
                        <SpanLink href="/library" className={`${styles.link} ${activeLink === '/library' ? styles.active : ''}`} tabIndex={getTabindex()}>
                            <div className={styles.icon}>
                                <LibraryIcon filled={activeLink === '/library'}/>
                            </div>
                            <div className={styles.label}>
                                Your Library
                            </div>
                        </SpanLink>
                        <div className={styles.operations}>
                            <button tabIndex={getTabindex()}>
                                <AddIcon strokeWidth={24} stroke="#aeaeae"/>
                            </button>
                            <button tabIndex={getTabindex()}>
                                <NextIcon strokeWidth={24} stroke="#aeaeae"/>
                            </button>
                        </div>
                    </div>
                    <div className={styles.libraryList}>
                        <SpanLink href="/">
                            <div className={styles.listItem} tabIndex={getTabindex()}>
                                <div className={styles.image}>
                                    <img src="/album_cover_1.jpg"/>
                                </div>
                                <div className={styles.info}>
                                    <div className={styles.name}>
                                        <Link href="/">Seek & Destroy - Remaster</Link>
                                    </div>
                                    <div className={styles.creator}>
                                        <Link href="/" tabIndex={getTabindex()}>Metallica</Link>
                                    </div>
                                </div>
                            </div>
                        </SpanLink>
                        <SpanLink href="/">
                            <div className={styles.listItem} tabIndex={getTabindex()}>
                                <div className={styles.image}>
                                    <img src="/album_cover_2.jpg"/>
                                </div>
                                <div className={styles.info}>
                                    <div className={styles.name}>
                                        <Link href="/">Heaven and Hell - 2009 Remaster</Link>
                                    </div>
                                    <div className={styles.creator}>
                                        <Link href="/" tabIndex={getTabindex()}>Black Sabbath</Link>
                                    </div>
                                </div>
                            </div>
                        </SpanLink>
                        <SpanLink href="/">
                            <div className={styles.listItem} tabIndex={getTabindex()}>
                                <div className={styles.image}>
                                    <img src="/album_cover_3.jpg"/>
                                </div>
                                <div className={styles.info}>
                                    <div className={styles.name}>
                                        <Link href="/">The Devil in I</Link>
                                    </div>
                                    <div className={styles.creator}>
                                        <Link href="/" tabIndex={getTabindex()}>Slipknot</Link>
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