import {useRouter} from 'next/router'
import Link from 'next/link'
import {useContext, useEffect, useRef, useState} from 'react'
import {NPBarResizingContext} from '@/pages/_app'
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
    const [, setIsResizing] = useContext(NPBarResizingContext) // Now playing bar resizing state
    const [showAlbumCover, _setShowAlbumCover] = useState(false) // Is album cover shown
    const [albumCoverRight, _setAlbumCoverRight] = useState(false) // Album cover right position
    const showAlbumCoverRef = useRef(showAlbumCover) // Ref for showAlbumCover
    const albumCoverRightRef = useRef(albumCoverRight) // Ref for albumCoverRight
    const [animateAlbumCover, setAnimateAlbumCover] = useState(false) // Animate album cover
    const [width, setWidth] = useState(null) // Now playing bar width
    const [MAX_WIDTH, setMaxWidth] = useState(null) // Max width of now playing bar
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

    // TODO: Remove this
    let ran = false
    useEffect(() => {
        if (ran) return
        ran = true

        setTimeout(() => setAnimateAlbumCover(true), 300) // Album cover can be animated after 300ms

        const nowPlayingBarWidth = parseInt(localStorage.getItem('nowPlayingBarWidth')) // Get width from local storage
        if (nowPlayingBarWidth) setWidth(nowPlayingBarWidth) // Set width to local storage value if it exists
        else setWidth(MAX_WIDTH) // Set width to max width when width is not set

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
        })
    })

    const handleResize = (e, side) => setIsResizing({ // Handle resizing
        active: true, // Set resizing state to active
        side, // Set resizing side
        MIN_WIDTH, // Set min width
        MAX_WIDTH, // Set max width
        offset: MAX_WIDTH - e.clientX, // Set offset
        setWidth: value => {
            setWidth(value) // Update width
            localStorage.setItem('nowPlayingBarWidth', value) // Save width to local storage
        }, // Pass setWidth function
    })

    const updateAlbumCoverData = () => {
        localStorage.setItem('bigAlbumCover', JSON.stringify({
            showAlbumCover: showAlbumCoverRef.current,
            albumCoverRight: albumCoverRightRef.current,
        })) // Save showAlbumCover and albumCoverRight to local storage
    }

    const toggleAlbumCover = () => {
        setShowAlbumCover(!showAlbumCover) // Toggle showAlbumCover
        updateAlbumCoverData() // Update album cover data
    }

    const toggleAlbumCoverRight = () => {
        setAlbumCoverRight(!albumCoverRight) // Toggle albumCoverRight
        updateAlbumCoverData() // Update album cover data
    }

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
            {typeof width === 'number' && (
                <div className={styles.nowPlayingBar}
                     style={{width: `${Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH)}px`}}>
                    <div
                        className={`${styles.nowPlayingBarWrapper} ${width < HIDING_BREAKPOINT ? styles.breakpoint : ''}`}>
                        <div className={`${styles.layoutResizer} ${styles.left}`}
                             onMouseDown={e => handleResize(e, 1)}></div>
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
                                    <PlayIcon/>
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
                                <button className={styles.button} onClick={() => router.pathname !== '/lyrics' ? router.push('/lyrics') : router.back()}>
                                    <MicrophoneIcon/>
                                </button>
                                <button className={styles.button}>
                                    <VolumeHighIcon/>
                                </button>
                                <button className={styles.button}>
                                    <CustomizationIcon/>
                                </button>
                                {width < HIDING_BREAKPOINT ? (
                                    <button className={styles.button}>
                                        <QueueIcon/>
                                    </button>
                                ) : ''}
                            </div>
                            {width >= HIDING_BREAKPOINT ? (
                                <>
                                    <div className={styles.separator}></div>
                                    <div className={styles.queue}>
                                        <div className={styles.queueImage}>
                                            <img src="/album_cover_2.jpg" alt=""/>
                                        </div>
                                        <div className={styles.queueText}>Queue</div>
                                    </div>
                                </>
                            ) : ''}
                        </div>
                        <div className={`${styles.layoutResizer} ${styles.right}`}
                             onMouseDown={e => handleResize(e, 2)}></div>
                    </div>
                </div>
            )}
        </>
    )
}