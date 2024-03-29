import axios from 'axios'
import {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {TrackPanelContext} from '@/contexts/track-panel'
import {QueueContext} from '@/contexts/queue'
import {ContextMenuContext} from '@/contexts/context-menu'
import Link from '@/components/link'
import Image from '@/components/image'
import Player from '@/components/player'
import Volume from '@/components/volume'
import {TooltipHandler} from '@/components/tooltip'
import TrackContextMenu from '@/components/context-menus/track'
import {
    AlbumDefault,
    CloseIcon,
    DownArrowIcon,
    ExplicitIcon,
    LeftArrowIcon,
    LikeIcon,
    MicrophoneIcon,
    NextTrackIcon,
    PauseIcon,
    PlayIcon,
    PrevTrackIcon,
    QueueIcon,
    RepeatIcon,
    RepeatOneIcon,
    RightArrowIcon,
    ShuffleIcon,
    UpArrowIcon,
} from '@/icons'
import styles from '@/styles/now-playing-bar.module.sass'
import Skeleton from 'react-loading-skeleton'

export default function NowPlayingBar() {
    const BAR_BREAKPOINT = 850 // Replace some elements when width is less than this value
    const [user] = useContext(AuthContext) // Get user from AuthContext
    const {
        isPlaying,
        handlePlayPause,
        loop,
        handleLoop,
        shuffle,
        handleShuffle,
        showQueuePanel,
        setShowQueuePanel,
        track,
        isLiked,
        setIsLiked,
        handlePrevTrack,
        handleNextTrack,
    } = useContext(QueueContext) // Audio controls context
    const [, setContextMenu] = useContext(ContextMenuContext) // Get setContextMenu function from ContextMenuContext
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

    const handleLike = async () => {
        if (!user || !user?.token || !user?.id) return // Return if user is not logged in

        try {
            const response = await axios.post(`${process.env.API_URL}/track/like/${track?._id}`, { // Request to like track
                like: isLiked ? -1 : 1,
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            })

            if (response.data?.status === 'OK') // If status is OK
                if (response.data?.liked) setIsLiked(true) // If track is liked, set isLiked to true
                else setIsLiked(false) // Otherwise, set isLiked to false
        } catch (e) {
        }
    }

    const handleContextMenu = e => {
        e.preventDefault()
        e.stopPropagation()

        setContextMenu({
            menu: <TrackContextMenu tracks={[{...track, liked: isLiked}]} toggleLikeTrack={handleLike}/>,
            x: e.clientX,
            y: e.clientY,
        })
    }

    return user?.loaded && user?.id && user?.token && track ? (
        <>
            <div
                className={`${!animateAlbumCover ? 'no_transition' : ''} ${styles.albumCover} ${showAlbumCover ? styles.show : ''} ${width >= maxWidth - 460 && showVisibilityBar && !minimizeBar ? styles.barOpened : ''} ${albumCoverRight ? styles.right : ''} ${width < maxWidth - 460 || minimizeBar ? styles.lower : ''}`}>
                <Image src={track?.album?.cover} width={248} height={248} format={'webp'} alt={track?.title}
                       alternative={<AlbumDefault/>} loading={<Skeleton width={248} height={248} style={{top: '-3px'}}/>}/>
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
                                <image href={`${process.env.IMAGE_CDN}/${track?.album?.cover}?width=100&height=100&format=webp`} width="110%"
                                       height="140" x="-5%" y="-25"
                                       preserveAspectRatio="none" filter="url(#displacementFilter)"/>
                            </svg>
                        ) : ''}
                        <div className={styles.blurBorder}></div>
                    </div>
                    <div className={`${styles.layoutResizer} ${styles.left}`}
                         onMouseDown={e => handleResizeDown(e, 1)}></div>
                    <div className={styles.track} onContextMenu={handleContextMenu}>
                        <div className={`${styles.trackImage} ${showAlbumCover ? styles.hide : ''}`}>
                            <Image src={track?.album?.cover} width={100} height={100} alt={track?.title} format={'webp'}
                                   alternative={<AlbumDefault/>} loading={<Skeleton width={63} height={63} style={{top: '-3px'}}/>}/>
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
                                    <span className={styles.title}>
                                        <TooltipHandler title={track?.title || ''}>
                                            {track?.title || ''}
                                        </TooltipHandler>
                                    </span>
                                    {track?.explicit ? (
                                        <span className={styles.explicit}>
                                            <TooltipHandler title={'Explicit content'}>
                                                <ExplicitIcon/>
                                            </TooltipHandler>
                                        </span>
                                    ) : ''}
                                </Link>
                                <TooltipHandler title={isLiked ? 'Unlike' : 'Like'}>
                                    <button className={styles.trackLike} onClick={handleLike}>
                                        <LikeIcon fill={isLiked ? process.env.ACCENT_COLOR : 'none'} stroke={isLiked ? process.env.ACCENT_COLOR : '#fff'}/>
                                    </button>
                                </TooltipHandler>
                            </div>
                            <div className={styles.trackArtist}>
                                <Link href={'/artist/[id]'} as={`/artist/${track?.album?.artist?._id}`}>
                                    <TooltipHandler title={track?.album?.artist?.name || ''}>
                                        {track?.album?.artist?.name || ''}
                                    </TooltipHandler>
                                </Link>
                                {track?.artists?.length ? track.artists.map((a) => (
                                    <>
                                    ,&nbsp;<TooltipHandler title={a?.name}>
                                        <Link href={'/artist/[id]'} as={`/artist/${a?._id}`}>
                                            {a?.name || ''}
                                        </Link>
                                    </TooltipHandler>
                                    </>
                                )) : ''}
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
                                <button className={`no_focus ${styles.prevTrack}`} onClick={handlePrevTrack}>
                                    <PrevTrackIcon strokeRate={1.25}/>
                                </button>
                            </TooltipHandler>
                            <TooltipHandler title={isPlaying ? 'Pause' : 'Play'}>
                                <button className={`no_focus ${styles.play}`}
                                        onClick={() => handlePlayPause()}>
                                    {isPlaying ? <PauseIcon fill={'#181818'}/> : <PlayIcon fill={'#181818'}/>}
                                </button>
                            </TooltipHandler>
                            <TooltipHandler title={'Next'}>
                                <button className={`no_focus ${styles.nextTrack}`} onClick={handleNextTrack}>
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
                                    <MicrophoneIcon strokeRate={1.2} width={20} height={20}/>
                                </button>
                            </TooltipHandler>
                            <TooltipHandler title={showQueuePanel ? 'Hide queue' : 'Show queue'}>
                                <button className={styles.button} onClick={() => setShowQueuePanel(prev => !prev)}>
                                    <QueueIcon strokeRate={1.2} width={20} height={20}/>
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
    ) : ''
}