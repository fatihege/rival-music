import Link from '@/components/custom-link'
import {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {TrackPanelContext} from '@/contexts/track-panel'
import {QueueContext} from '@/contexts/queue'
import {
    AlbumDefault,
    CloseIcon, DownArrowIcon,
    LeftArrowIcon,
    LikeIcon,
    MicrophoneIcon,
    NextTrackIcon, PauseIcon,
    PlayIcon,
    PrevTrackIcon,
    QueueIcon,
    RepeatIcon, RepeatOneIcon,
    RightArrowIcon,
    ShuffleIcon, UpArrowIcon,
} from '@/icons'
import Player from '@/components/player'
import styles from '@/styles/now-playing-bar.module.sass'
import Volume from '@/components/volume'
import {TooltipHandler} from '@/components/tooltip'

export default function NowPlayingBar() {
    const BAR_BREAKPOINT = 850 // Replace some elements when width is less than this value
    const {
        queueIndex,
        setQueueIndex,
        isPlaying,
        handlePlayPause,
        handleEnded,
        loop,
        handleLoop,
        shuffle,
        handleShuffle,
        handleSeek,
        track
    } = useContext(QueueContext) // Audio controls context
    const [trackPanel, setTrackPanel] = useContext(TrackPanelContext) // Track panel state
    const [isResizing, _setIsResizing] = useState(false) // Is now playing bar resizing
    const [resizingSide, setResizingSide] = useState(0) // Side of now playing bar to resize
    const [showAlbumCover, setShowAlbumCover] = useState(null) // Is album cover shown
    const [albumCoverRight, setAlbumCoverRight] = useState(null) // Album cover right position
    const [showVisibilityBar, setShowVisibilityBar] = useState(false)
    const [minimizeBar, setMinimizeBar] = useState(false)
    const [animateAlbumCover, setAnimateAlbumCover] = useState(false) // Animate album cover
    const [width, _setWidth] = useState(null) // Now playing bar width
    const [maxWidth, setMaxWidth] = useState(null) // Max width of now playing bar
    const minWidth = 700 // Min width of now playing bar
    const widthRef = useRef(width) // Ref for now playing bar width
    const isResizingRef = useRef(isResizing) // Reference for now playing bar resizing state
    const mouseOverRef = useRef(false) // Is mouse over the bar
    const visibilityBarTimeoutRef = useRef(null) // Timeout reference for visibility bar

    const setWidth = value => {
        widthRef.current = value
        _setWidth(value)
    }

    const setIsResizing = value => {
        isResizingRef.current = value
        _setIsResizing(value)
    }

    const updateAlbumCoverData = () => {
        localStorage.setItem('bigAlbumCover', JSON.stringify({ // Save showAlbumCover and albumCoverRight to local storage
            showAlbumCover: showAlbumCover,
            albumCoverRight: albumCoverRight,
        }))
    }

    const toggleAlbumCover = () => setShowAlbumCover(!showAlbumCover) // Toggle showAlbumCover

    const toggleAlbumCoverRight = () => setAlbumCoverRight(!albumCoverRight) // Toggle albumCoverRight

    useEffect(() => {
        if (showAlbumCover === null || albumCoverRight === null) return // If the states are in default value, return
        updateAlbumCoverData() // Otherwise, update the local album cover data
    }, [showAlbumCover, albumCoverRight])

    useEffect(() => {
        setTimeout(() => setAnimateAlbumCover(true), 300) // Album cover can be animated after 300ms

        try {
            const bigAlbumCover = JSON.parse(localStorage.getItem('bigAlbumCover')) // Get big album cover from local storage
            setShowAlbumCover(!!bigAlbumCover?.showAlbumCover) // Set showAlbumCover to local storage value if it exists
            setAlbumCoverRight(!!bigAlbumCover?.albumCoverRight) // Set albumCoverRight to local storage value if it exists
        } catch (e) {
            localStorage.removeItem('bigAlbumCover')
        }

        setMaxWidth(window.innerWidth - 48) // Max width of now playing bar is window width - 48

        window.addEventListener('resize', () => { // When window resize
            setMaxWidth(window.innerWidth - 48) // Max width of now playing bar is window width - 48
            setWidth(widthRef.current || window.innerWidth - 48) // Set width to max width
        })

        const nowPlayingBarWidth = parseInt(localStorage.getItem('nowPlayingBarWidth')) // Get width from local storage
        if (nowPlayingBarWidth) setWidth(nowPlayingBarWidth) // Set width to local storage value if it exists
        else setWidth(window.innerWidth - 48) // Set width to max width when width is not set

        if (localStorage.getItem('minimizeBar') === 'true') setMinimizeBar(true) // If minimizeBar value in local storage is equal to true, minimize bar
        else localStorage.removeItem('minimizeBar') // Else, remove the key from local storage
    }, [])

    const handleResizeDown = useCallback((e, side) => {
        setIsResizing(true) // Set resizing to true
        setResizingSide(side) // Set resizing side
        setShowVisibilityBar(false) // Hide visibility bar
    }, []) // Handle resizing down

    const handleResizeUp = useCallback(e => {
        if (!isResizing) return

        e.preventDefault()
        e.stopPropagation()

        setIsResizing(false) // Set resizing to false
    }, [isResizing]) // Handle resizing down

    const handleResize = useCallback(e => {
        if (!isResizing) return // Return if resizing is not active

        e.preventDefault()
        e.stopPropagation()

        const newWidth = resizingSide === 1 ? window.innerWidth - e.clientX * 2 : window.innerWidth - (window.innerWidth - e.clientX) * 2 // Calculate new width of now playing bar
        setWidth(Math.max(Math.min(newWidth, maxWidth), minWidth)) // Set width of now playing bar
        localStorage.setItem('nowPlayingBarWidth', newWidth) // Save width to local storage
    }, [isResizing, maxWidth]) // Handle resizing

    const handleMouseOver = () => {
        mouseOverRef.current = true // Set mouse over state to true
        visibilityBarTimeoutRef.current = setTimeout(() => { // Initialize timeout for visibility bar
            if (isResizingRef.current) return // Return if now playing bar is resizing
            if (mouseOverRef.current) setShowVisibilityBar(true) // If mouse is over the now playing bar, show visibility bar
        }, 500) // After 500ms
    }

    const handleMouseLeave = () => {
        mouseOverRef.current = false // Set mouse over state to false
        setShowVisibilityBar(false) // Hide visibility bar
        clearTimeout(visibilityBarTimeoutRef.current) // Clear visibility bar timeout
    }

    const toggleMinimizeBar = () => {
        setMinimizeBar(!minimizeBar) // Toggle minimize bar value
        setShowVisibilityBar(false) // Hide visibility bar

        if (!minimizeBar) localStorage.setItem('minimizeBar', 'true') // If the bar is minimized, set value to local storage
        else localStorage.removeItem('minimizeBar') // Otherwise, remove the key from local storage
    }

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

    const handlePrev = () => {
        console.log('QUEUE INDEX', queueIndex)
        if (queueIndex === 0) handleSeek(0) // If queue index is 0, seek to 0
        else setQueueIndex(queueIndex - 1) // Otherwise, decrease queue index by 1
    }

    const handleNext = () => handleEnded(true) // Handle next track

    return track && (
        <>
            <div
                className={`${!animateAlbumCover ? 'no_transition' : ''} ${styles.albumCover} ${showAlbumCover ? styles.show : ''} ${width >= maxWidth - 516 && showVisibilityBar && !minimizeBar ? styles.barOpened : ''} ${albumCoverRight ? styles.right : ''} ${width < maxWidth - 516 || minimizeBar ? styles.lower : ''}`}>
                {track?.album?.cover ?
                    <img src={`${process.env.IMAGE_CDN}/${track?.album?.cover}`} alt={track?.title}/> : <AlbumDefault/>}
                <div className={styles.overlay}>
                    <TooltipHandler title={albumCoverRight ? 'Move left' : 'Move right'}>
                        <button className={styles.button} onClick={() => toggleAlbumCoverRight()}>
                            {albumCoverRight ? <LeftArrowIcon stroke={'#f3f3f3'} strokeRate={1.3}/> :
                                <RightArrowIcon stroke={'#f3f3f3'} strokeRate={1.3}/>}
                        </button>
                    </TooltipHandler>
                    <TooltipHandler title={'Hide big album cover'}>
                        <button className={styles.button} onClick={() => toggleAlbumCover()}>
                            <CloseIcon stroke={'#f3f3f3'} strokeRate={1.5}/>
                        </button>
                    </TooltipHandler>
                </div>
            </div>
            <div className={`${styles.bar} ${minimizeBar ? styles.minimized : ''}`}
                 style={{
                     width: `${minimizeBar ? minWidth : Math.min(Math.max(widthRef.current, minWidth), maxWidth)}px`,
                     transitionProperty: isResizing ? 'bottom' : 'width, bottom'
                 }}
                 onMouseEnter={() => handleMouseOver()}
                 onMouseLeave={() => handleMouseLeave()}
            >
                <div className={`${styles.visibilityBar} ${!showVisibilityBar ? styles.hide : ''}`}
                     onClick={() => toggleMinimizeBar()}>
                    <div className={styles.icon}>
                        {minimizeBar
                            ? <UpArrowIcon strokeRate={1.25} stroke={'#a8a8a8'}/>
                            : <DownArrowIcon strokeRate={1.25} stroke={'#a8a8a8'}/>}
                    </div>
                </div>
                <div
                    className={`${styles.barWrapper} ${width < BAR_BREAKPOINT || minimizeBar ? styles.breakpoint : ''}`}>
                    <div className={styles.blurryBackground}>
                        {track?.album?.cover ? (
                            <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="100%" height="100%">
                                <filter id="displacementFilter">
                                    <feTurbulence type="turbulence" baseFrequency=".01 .01"
                                                  numOctaves="3" result="turbulence" seed="10"/>
                                    <feDisplacementMap in2="turbulence" in="SourceGraphic"
                                                       scale="40" xChannelSelector="R" yChannelSelector="B"/>
                                </filter>
                                <image href={`${process.env.IMAGE_CDN}/${track?.album?.cover}`} width="110%"
                                       height="140" x="-5%" y="-25"
                                       preserveAspectRatio="none" filter="url(#displacementFilter)"/>
                            </svg>
                        ) : ''}
                        <div className={styles.blurBorder}></div>
                    </div>
                    <div className={`${styles.layoutResizer} ${styles.left}`}
                         onMouseDown={e => handleResizeDown(e, 1)}></div>
                    <div className={styles.track}>
                        <div className={`${styles.trackImage} ${showAlbumCover ? styles.hide : ''}`}>
                            <img src={`${process.env.IMAGE_CDN}/${track?.album?.cover}`} alt={track?.title}/>
                            <div className={styles.overlay}>
                                <TooltipHandler title={'Show big album cover'}>
                                    <button className={styles.hideButton}
                                            onClick={() => toggleAlbumCover()}>
                                        <LeftArrowIcon strokeRate={1.2}/>
                                    </button>
                                </TooltipHandler>
                            </div>
                        </div>
                        <div className={styles.trackInfo}>
                            <div className={styles.trackName}>
                                <Link href={'/album/[id]'} as={`/album/${track?.album?._id}#${track?._id}`}>
                                    {track?.title || ''}
                                </Link>
                                <TooltipHandler title={'Like'}>
                                    <button className={styles.trackLike}>
                                        <LikeIcon/>
                                    </button>
                                </TooltipHandler>
                            </div>
                            <div className={styles.trackArtist}>
                                <Link href={'/artist/[id]'} as={`/artist/${track?.album?.artist?._id}`}>
                                    {track?.album?.artist?.name || ''}
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className={styles.trackControls}>
                        <div className={styles.buttons}>
                            <TooltipHandler
                                title={loop === 2 ? 'Disable repeat' : loop === 1 ? 'Enable repeat one' : 'Enable repeat'}>
                                <button className={`no_focus ${styles.repeat} ${loop > 0 ? styles.active : ''}`}
                                        onClick={() => handleLoop()}>
                                    {loop === 2 ? <RepeatOneIcon strokeRate={1.25}/> : <RepeatIcon strokeRate={1.25}/>}
                                </button>
                            </TooltipHandler>
                            <TooltipHandler title={'Previous'}>
                                <button className={`no_focus ${styles.prevTrack}`} onClick={handlePrev}>
                                    <PrevTrackIcon strokeRate={1.25}/>
                                </button>
                            </TooltipHandler>
                            <TooltipHandler title={isPlaying ? 'Pause' : 'Play'}>
                                <button className={`no_focus ${styles.play}`} onKeyDown={e => e.preventDefault()}
                                        onClick={() => handlePlayPause()}>
                                    {isPlaying ? <PauseIcon fill={'#181818'}/> : <PlayIcon fill={'#181818'}/>}
                                </button>
                            </TooltipHandler>
                            <TooltipHandler title={'Next'}>
                                <button className={`no_focus ${styles.nextTrack}`} onClick={handleNext}>
                                    <NextTrackIcon strokeRate={1.25}/>
                                </button>
                            </TooltipHandler>
                            <TooltipHandler title={shuffle ? 'Disable shuffle' : 'Enable shuffle'}>
                                <button className={`no_focus ${styles.shuffle} ${shuffle ? styles.active : ''}`}
                                        onClick={() => handleShuffle()}>
                                    <ShuffleIcon strokeRate={1.25}/>
                                </button>
                            </TooltipHandler>
                        </div>
                        <Player duration={300}/>
                    </div>
                    <div className={styles.otherControls}>
                        <div className={styles.buttons}>
                            <TooltipHandler title={'Open lyrics panel'}>
                                <button className={styles.button}
                                        onClick={() => setTrackPanel({...trackPanel, active: !trackPanel.active})}>
                                    <MicrophoneIcon strokeRate={1.2}/>
                                </button>
                            </TooltipHandler>
                            <TooltipHandler title={'Show queue'}>
                                <button className={styles.button}>
                                    <QueueIcon strokeRate={1.2}/>
                                </button>
                            </TooltipHandler>
                            <div className={styles.volume}>
                                <Volume/>
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.layoutResizer} ${styles.right}`}
                         onMouseDown={e => handleResizeDown(e, 2)}></div>
                </div>
            </div>
        </>
    )
}