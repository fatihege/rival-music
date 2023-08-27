import axios from 'axios'
import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import {TrackPanelContext} from '@/contexts/track-panel'
import {QueueContext} from '@/contexts/queue'
import Link from '@/components/link'
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
    RepeatOneIcon, AlbumDefault
} from '@/icons'
import styles from '@/styles/track-panel.module.sass'

export default function TrackPanel() {
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
        track
    } = useContext(QueueContext) // Audio controls context
    const [trackPanel, setTrackPanel] = useContext(TrackPanelContext) // Track panel state
    const [fade, setFade] = useState(false) // Can the panel fade in
    const [lyrics, setLyrics] = useState(null) // Lyrics state
    const lyricsRef = useRef() // Lyrics ref
    const activeRef = useRef() // Lyrics ref

    const getLyrics = async () => {
        const response = await axios.get(`${process.env.API_URL}/track/lyrics/${track._id}`)
        if (response.data?.status === 'OK') setLyrics(response.data?.lyrics || null)
    }

    useEffect(() => {
        setFade(true) // Fade in pane
    }, [])

    useEffect(() => {
        getLyrics() // Get lyrics
    }, [track])

    useEffect(() => {
        if (activeRef.current) lyricsRef.current.scrollTo({
            top: activeRef.current.offsetTop - lyricsRef.current.offsetTop - 40,
            behavior: 'smooth'
        })
        else lyricsRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }, [activeRef.current])

    const close = () => setTrackPanel({...trackPanel, active: false}) // Close track panel

    const handlePrev = () => {
        if (queueIndex === 0) handleSeek(0) // If queue index is 0, seek to 0
        else setQueueIndex(queueIndex - 1) // Otherwise, decrease queue index by 1
    }

    const handleNext = () => handleEnded(true) // Handle next track

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
                            <image href={`${process.env.IMAGE_CDN}/${track.album.cover}`} width="110%" height="110%"
                                   x="-20" y="-20" preserveAspectRatio="none"
                                   filter="url(#displacementFilter)"/>
                            <image href={`${process.env.IMAGE_CDN}/${track.album.cover}`} width="60%" height="50%"
                                   x="40%" y="-20" preserveAspectRatio="none"
                                   filter="url(#displacementFilter)"/>
                            <image href={`${process.env.IMAGE_CDN}/${track.album.cover}`} width="50%" height="50%"
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
                                {track?.album?.cover ?
                                    <img src={`${process.env.IMAGE_CDN}/${track?.album?.cover}`} alt={track?.title}/> :
                                    <AlbumDefault/>}
                            </div>
                            <div className={styles.trackInfo}>
                                <div className={styles.trackTitle}>{track?.title}</div>
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
                                        <button className="no_focus" onClick={handlePrev}>
                                            <PanelPrevTrackIcon/>
                                        </button>
                                    </TooltipHandler>
                                    <TooltipHandler title={isPlaying ? 'Pause' : 'Play'}>
                                        <button className="no_focus" onKeyDown={e => e.preventDefault()}
                                                onClick={() => handlePlayPause()}>
                                            {!isPlaying ? <PlayIcon/> : <PauseIcon/>}
                                        </button>
                                    </TooltipHandler>
                                    <TooltipHandler title={'Next'}>
                                        <button className="no_focus" onClick={handleNext}>
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
                        <div className={styles.lyrics} ref={lyricsRef}>
                            {!lyrics?.length ? <span className={styles.noLyrics}>No lyrics to display.</span> : (
                                <div className={styles.lyricsInner}>
                                    {lyrics.map((l, i) => (
                                        <div key={i}
                                             className={`${styles.lyric} ${currentTime * 1000 >= l.start && (lyrics[i + 1]?.start || currentTime * 1000 + 1) > currentTime * 1000 ? styles.active : ''}`}
                                             onClick={() => handleSeek(l.start / 1000)} ref={currentTime * 1000 >= l.start && (lyrics[i + 1]?.start || currentTime * 1000 + 1) > currentTime * 1000 ? activeRef : null}>
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