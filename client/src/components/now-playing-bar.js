import {useRouter} from 'next/router'
import Link from 'next/link'
import {useCallback, useEffect, useRef, useState} from 'react'
import {
    CloseIcon,
    CustomizationIcon, LeftArrowIcon,
    LikeIcon, MicrophoneIcon,
    NextTrackIcon,
    PlayIcon,
    PrevTrackIcon,
    QueueIcon,
    RepeatIcon, RightArrowIcon,
    ShuffleIcon,
    VolumeHighIcon
} from '@/icons'
import ProgressBar from '@/components/progress-bar'
import styles from '@/styles/now-playing-bar.module.sass'

export default function NowPlayingBar() {
    const router = useRouter() // Router instance
    const [isResizing, setIsResizing] = useState(false) // Is now playing bar resizing
    const [resizingSide, setResizingSide] = useState(0) // Side of now playing bar to resize
    const [showAlbumCover, _setShowAlbumCover] = useState(false) // Is album cover shown
    const [albumCoverRight, _setAlbumCoverRight] = useState(false) // Album cover right position
    const showAlbumCoverRef = useRef(showAlbumCover) // Ref for showAlbumCover
    const albumCoverRightRef = useRef(albumCoverRight) // Ref for albumCoverRight
    const [animateAlbumCover, setAnimateAlbumCover] = useState(false) // Animate album cover
    const [MAX_WIDTH, setMaxWidth] = useState(null) // Max width of now playing bar
    const [width, _setWidth] = useState(null) // Now playing bar width
    const widthRef = useRef(width) // Ref for now playing bar width
    const MIN_WIDTH = 700 // Min width of now playing bar
    const HIDING_BREAKPOINT = 800 // Hide some elements when width is less than this value

    const setShowAlbumCover = (value) => {
        _setShowAlbumCover(value) // Set showAlbumCover
        showAlbumCoverRef.current = value // Update ref
    }

    const setAlbumCoverRight = (value) => {
        _setAlbumCoverRight(value) // Set albumCoverRight
        albumCoverRightRef.current = value // Update ref
    }

    const setWidth = (value) => {
        _setWidth(value) // Set width
        widthRef.current = value // Update ref
    }

    const updateAlbumCoverData = () => {
        localStorage.setItem('bigAlbumCover', JSON.stringify({ // Save showAlbumCover and albumCoverRight to local storage
            showAlbumCover: showAlbumCoverRef.current,
            albumCoverRight: albumCoverRightRef.current,
        }))
    }

    const toggleAlbumCover = () => {
        setShowAlbumCover(!showAlbumCover) // Toggle showAlbumCover
        updateAlbumCoverData() // Update album cover data
    }

    const toggleAlbumCoverRight = () => {
        setAlbumCoverRight(!albumCoverRight) // Toggle albumCoverRight
        updateAlbumCoverData() // Update album cover data
    }

    useEffect(() => {
        setTimeout(() => setAnimateAlbumCover(true), 300) // Album cover can be animated after 300ms

        try {
            const bigAlbumCover = JSON.parse(localStorage.getItem('bigAlbumCover')) // Get big album cover from local storage
            setShowAlbumCover(bigAlbumCover.showAlbumCover || false) // Set showAlbumCover to local storage value if it exists
            setAlbumCoverRight(bigAlbumCover.albumCoverRight || false) // Set albumCoverRight to local storage value if it exists
        } catch (e) {
            localStorage.removeItem('bigAlbumCover') // Remove big album cover from local storage if it is invalid
        }

        setMaxWidth(window.innerWidth - 48) // Max width of now playing bar is window width - 48

        window.addEventListener('resize', () => { // When window resize
            setMaxWidth(window.innerWidth - 48) // Max width of now playing bar is window width - 48
            setWidth(widthRef.current || window.innerWidth - 48) // Set width to max width
        })

        const nowPlayingBarWidth = parseInt(localStorage.getItem('nowPlayingBarWidth')) // Get width from local storage
        if (nowPlayingBarWidth) setWidth(nowPlayingBarWidth) // Set width to local storage value if it exists
        else setWidth(window.innerWidth - 48) // Set width to max width when width is not set
    }, [])

    const handleResizeDown = useCallback((e, side) => {
        e.preventDefault()
        e.stopPropagation()
        setIsResizing(true) // Set resizing to true
        setResizingSide(side) // Set resizing side
    }, []) // Handle resizing down

    const handleResizeUp = useCallback(e => {
        e.preventDefault()
        e.stopPropagation()
        if (isResizing) setIsResizing(false) // Set resizing to false
    }, [isResizing]) // Handle resizing down

    const handleResize = useCallback(e => {
        e.preventDefault()
        e.stopPropagation()
        if (!isResizing) return // Return if resizing is not active

        const newWidth = resizingSide === 1 ? window.innerWidth - e.clientX * 2 : window.innerWidth - (window.innerWidth - e.clientX) * 2 // Calculate new width of now playing bar
        setWidth(Math.max(Math.min(newWidth, MAX_WIDTH), MIN_WIDTH)) // Set width of now playing bar
        localStorage.setItem('nowPlayingBarWidth', newWidth) // Save width to local storage
    }, [isResizing, MAX_WIDTH]) // Handle resizing

    useEffect(() => {
        document.addEventListener('mousemove', handleResize)
        document.addEventListener('mouseup', handleResizeUp)
        document.addEventListener('mouseleave', handleResizeUp)

        return () => { // Remove event listeners when component unmount
            document.removeEventListener('mousemove', handleResize)
            document.removeEventListener('mouseup', handleResizeUp)
            document.removeEventListener('mouseleave', handleResizeUp)
        }
    }, [handleResize])

    return (
        <>
            <div
                className={`${!animateAlbumCover ? 'no_transition' : ''} ${styles.albumCover} ${showAlbumCover ? styles.show : ''} ${albumCoverRight ? styles.right : ''} ${width < MAX_WIDTH - 516 ? styles.lower : ''}`}>
                <img src="/album_cover_1.jpg" alt="Album Cover"/>
                <div className={styles.overlay}>
                    <button className={styles.button} onClick={() => toggleAlbumCoverRight()}>
                        {albumCoverRight ? <LeftArrowIcon stroke={'#c7c7c7'}/> : <RightArrowIcon stroke={'#c7c7c7'}/>}
                    </button>
                    <button className={styles.button} onClick={() => toggleAlbumCover()}>
                        <CloseIcon stroke={'#c7c7c7'}/>
                    </button>
                </div>
            </div>
            <div className={styles.nowPlayingBar}
                 style={{width: `${Math.min(Math.max(widthRef.current, MIN_WIDTH), MAX_WIDTH)}px`}}>
                <div
                    className={`${styles.nowPlayingBarWrapper} ${width < HIDING_BREAKPOINT ? styles.breakpoint : ''}`}>
                    <div className={`${styles.layoutResizer} ${styles.left}`}
                         onMouseDown={e => handleResizeDown(e, 1)}></div>
                    <div className={styles.track}>
                        <div className={`${styles.trackImage} ${showAlbumCover ? styles.hide : ''}`}>
                            <img src="/album_cover_1.jpg" alt="Album Cover"/>
                            <div className={styles.overlay}>
                                <button className={styles.hideButton}
                                        onClick={() => toggleAlbumCover()}>
                                    <LeftArrowIcon/>
                                </button>
                            </div>
                        </div>
                        <div className={styles.trackInfo}>
                            <div className={styles.trackName}>
                                <Link href="/" className={width < HIDING_BREAKPOINT ? 'hide' : ''}>
                                    Seek & Destroy - Remastered
                                </Link>
                                <button className={styles.trackLike}>
                                    <LikeIcon strokeWidth={12}/>
                                </button>
                            </div>
                            <div className={`${styles.trackArtist} ${width < HIDING_BREAKPOINT ? 'hide' : ''}`}>
                                <Link href="/">
                                    Metallica
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className={styles.trackControls}>
                        <div className={styles.buttons}>
                            <button className={styles.repeat}>
                                <RepeatIcon/>
                            </button>
                            <button className={styles.prevTrack}>
                                <PrevTrackIcon/>
                            </button>
                            <button className={styles.play}>
                                <PlayIcon fill={'#181818'}/>
                            </button>
                            <button className={styles.nextTrack}>
                                <NextTrackIcon/>
                            </button>
                            <button className={styles.shuffle}>
                                <ShuffleIcon/>
                            </button>
                        </div>
                        <ProgressBar duration={6 * 60 + 55}/>
                    </div>
                    <div className={styles.otherControls}>
                        <div className={styles.buttons}>
                            <button className={styles.button}
                                    onClick={() => router.pathname !== '/lyrics' ? router.push('/lyrics') : router.back()}>
                                <MicrophoneIcon/>
                            </button>
                            <button className={styles.button}>
                                <VolumeHighIcon/>
                            </button>
                            <button className={styles.button}>
                                <CustomizationIcon/>
                            </button>
                            <button className={styles.button}>
                                <QueueIcon/>
                            </button>
                        </div>
                    </div>
                    <div className={`${styles.layoutResizer} ${styles.right}`}
                         onMouseDown={e => handleResizeDown(e, 2)}></div>
                </div>
            </div>
        </>
    )
}