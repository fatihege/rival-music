import axios from 'axios'
import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {TrackPanelContext} from '@/contexts/track-panel'
import {QueueContext} from '@/contexts/queue'
import Link from '@/components/link'
import Image from '@/components/image'
import Player from '@/components/player'
import Volume from '@/components/volume'
import {TooltipHandler} from '@/components/tooltip'
import {
    CloseIcon,
    PlayIcon,
    RepeatIcon,
    ShuffleIcon,
    PanelPrevTrackIcon,
    PanelNextTrackIcon,
    PauseIcon,
    RepeatOneIcon, AlbumDefault, ExplicitIcon
} from '@/icons'
import styles from '@/styles/track-panel.module.sass'
import Skeleton from 'react-loading-skeleton'

export default function TrackPanel() {
    const [user] = useContext(AuthContext) // Get user from auth context
    const {
        currentTime,
        queueIndex,
        setQueueIndex,
        isPlaying,
        handlePlayPause,
        handleSeek,
        handleEnded,
        loop,
        handleLoop,
        shuffle,
        handleShuffle,
        track,
        handleNextTrack,
        handlePrevTrack,
    } = useContext(QueueContext) // Audio controls context
    const [trackPanel, setTrackPanel] = useContext(TrackPanelContext) // Track panel state
    const [fade, setFade] = useState(false) // Can the panel fade in
    const [lyrics, setLyrics] = useState(null) // Lyrics state
    const [notSynced, setNotSynced] = useState(true) // Not synced state
    const lyricsRef = useRef() // Lyrics ref
    const lyricsInnerRef = useRef() // Lyrics inner ref
    const activeRef = useRef() // Lyrics ref
    const playButton = useRef() // Play button ref

    const getLyrics = async () => {
        if (!user?.loaded || !user?.id || !user?.token) return // If user is not loaded, return

        const response = await axios.get(`${process.env.API_URL}/track/lyrics/${track._id}`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        if (response.data?.status === 'OK') {
            setLyrics(response.data?.lyrics || [])
        } else setLyrics([])
    }

    useEffect(() => {
        setFade(true) // Fade in pane
    }, [])

    useEffect(() => {
        getLyrics() // Get lyrics
    }, [track])

    useEffect(() => {
        if (lyrics?.length) {
            scrollToActiveLyric(false) // Scroll to active lyric when lyrics are loaded
            if (lyrics.filter((l, i) => lyrics.findIndex(l2 => l2.start === l.start) !== i).length) setNotSynced(true)
            else setNotSynced(false)
        }
    }, [lyrics])

    useEffect(() => {
        scrollToActiveLyric() // Scroll to active lyric
    }, [activeRef.current])

    useEffect(() => {
        if (playButton.current && !playButton.current?.focused) {
            playButton.current.focus() // Focus on play button when track panel is opened
            playButton.current.focused = true // Set focused to true
        }
    }, [playButton.current])

    const scrollToActiveLyric = () => {
        if (notSynced) return

        if (activeRef.current) lyricsRef.current.scrollTo({ // If there is active lyric, scroll to it
            top: activeRef.current.offsetTop - (lyricsRef.current.clientHeight / 2 - activeRef.current.clientHeight / 2), // Calculate scroll position to center active lyric
            behavior: 'smooth'
        })
        else lyricsRef.current.scrollTo({ // Otherwise, Scroll to top
            top: 0,
            behavior: 'smooth'
        })
    }

    const close = () => setTrackPanel({...trackPanel, active: false}) // Close track panel

    const isActive = (l, i) => currentTime * 1000 >= l.start && (lyrics[i + 1]?.start || currentTime * 1000 + 1) > currentTime * 1000

    return (
        <>
            <Head>
                <title>{track?.title ? `${track.title} by ${track?.album?.artist?.name} — ` : ''}Rival Music</title>
            </Head>
            <div className={`${styles.container} ${fade ? styles.fadeIn : ''}`}>
                <div className={styles.background}>
                    {track?.album?.cover ? (
                        <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="100%" height="100%">
                            <filter id="displacementFilter">
                                <feTurbulence type="turbulence" baseFrequency=".01 .01"
                                              numOctaves="4" result="turbulence" seed="10"/>
                                <feDisplacementMap in2="turbulence" in="SourceGraphic"
                                                   scale="60" xChannelSelector="R" yChannelSelector="B"/>
                            </filter>
                            <image href={`${process.env.IMAGE_CDN}/${track.album.cover}?width=120&height=120&format=webp`} width="110%" height="110%"
                                   x="-20" y="-20" preserveAspectRatio="none"
                                   filter="url(#displacementFilter)"/>
                            <image href={`${process.env.IMAGE_CDN}/${track.album.cover}?width=120&height=120&format=webp`} width="60%" height="50%"
                                   x="40%" y="-20" preserveAspectRatio="none"
                                   filter="url(#displacementFilter)"/>
                            <image href={`${process.env.IMAGE_CDN}/${track.album.cover}?width=120&height=120&format=webp`} width="50%" height="50%"
                                   x="-10%" y="40%" preserveAspectRatio="none"
                                   filter="url(#displacementFilter)"/>
                        </svg>
                    ) : ''}
                </div>
                <div className={styles.wrapper}>
                    <div className={styles.close} onClick={close}>
                        <TooltipHandler title={'Close panel'}>
                            <CloseIcon/>
                        </TooltipHandler>
                    </div>
                    <div className={styles.innerContainer}>
                        <div className={styles.controls}>
                            <div className={styles.albumCover}>
                                <Image src={track?.album?.cover} alt={track?.title} width={500} height={500}
                                       alternative={<AlbumDefault/>}
                                       loading={<Skeleton height={500} style={{top: '-3px'}}/>}/>
                            </div>
                            <div className={styles.trackInfo}>
                                <Link href={'/album/[id]'} as={`/album/${track?.album?._id}#${track?._id}`} className={styles.trackTitle}
                                    onClick={close}>
                                    {track?.title}
                                    {track?.explicit && (
                                        <TooltipHandler title={'Explicit content'}>
                                            <span className={styles.explicit}>
                                                <ExplicitIcon/>
                                            </span>
                                        </TooltipHandler>
                                    )}
                                </Link>
                                <div className={styles.trackArtistAndAlbum}>
                                    <Link href={'/artist/[id]'} as={`/artist/${track?.album?.artist?._id}`}
                                          onClick={close}>{track?.album?.artist?.name}</Link>
                                    &nbsp;—&nbsp;
                                    <Link href={'/album/[id]'} as={`/album/${track?.album?._id}`}
                                          onClick={close}>{track?.album?.title}</Link>
                                </div>
                            </div>
                            <div className={styles.player}>
                                <div className={styles.playerControls}>
                                    <TooltipHandler
                                        title={loop === 2 ? 'Disable repeat' : loop === 1 ? 'Enable repeat one' : 'Enable repeat'}>
                                        <button className={`no_focus ${loop > 0 ? styles.active : ''}`}
                                                onClick={() => handleLoop()}>
                                            {loop === 2 ? <RepeatOneIcon strokeRate={1.5}/> :
                                                <RepeatIcon strokeRate={1.5}/>}
                                        </button>
                                    </TooltipHandler>
                                    <TooltipHandler title={'Previous'}>
                                        <button className={`no_focus ${styles.bigger}`} onClick={handlePrevTrack}>
                                            <PanelPrevTrackIcon/>
                                        </button>
                                    </TooltipHandler>
                                    <TooltipHandler title={isPlaying ? 'Pause' : 'Play'}>
                                        <button className={`no_focus ${styles.bigger} ${styles.play}`}
                                                onClick={() => handlePlayPause()} ref={playButton}>
                                            {!isPlaying ? <PlayIcon rounded={true}/> : <PauseIcon/>}
                                        </button>
                                    </TooltipHandler>
                                    <TooltipHandler title={'Next'}>
                                        <button className={`no_focus ${styles.bigger}`} onClick={handleNextTrack}>
                                            <PanelNextTrackIcon/>
                                        </button>
                                    </TooltipHandler>
                                    <TooltipHandler title={shuffle ? 'Disable shuffle' : 'Enable shuffle'}>
                                        <button className={`no_focus ${shuffle ? styles.active : ''}`}
                                                onClick={() => handleShuffle()}>
                                            <ShuffleIcon strokeRate={1.5}/>
                                        </button>
                                    </TooltipHandler>
                                </div>
                                <Player duration={6 * 60 + 36} type="full"/>
                                <div className={styles.volumeBar}>
                                    <Volume/>
                                </div>
                            </div>
                        </div>
                        <div className={`${styles.lyrics} ${notSynced ? styles.notSynced : ''}`} ref={lyricsRef}>
                            {!lyrics?.length ? <span className={styles.noLyrics}>{lyrics === null ? 'Loading lyrics...' : 'No lyrics to display.'}</span> : (
                                <div className={styles.lyricsInner} ref={lyricsInnerRef}>
                                    {lyrics.map((l, i) => (
                                        <div key={i}
                                             className={`${styles.lyric} ${isActive(l, i) ? styles.active : ''}`}
                                             onClick={() => handleSeek(l.start / 1000)} ref={isActive(l, i) ? activeRef : null}>
                                            {l.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}