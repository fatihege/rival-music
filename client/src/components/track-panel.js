import Head from 'next/head'
import {useContext, useEffect, useState} from 'react'
import {TrackPanelContext} from '@/contexts/track-panel'
import {QueueContext} from '@/contexts/queue'
import Link from '@/components/custom-link'
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
    const {isPlaying, handlePlayPause, loop, handleLoop, shuffle, handleShuffle, track} = useContext(QueueContext) // Audio controls context
    const [trackPanel, setTrackPanel] = useContext(TrackPanelContext) // Track panel state
    const [fade, setFade] = useState(false) // Can the panel fade in

    useEffect(() => {
        setFade(true) // Fade in pane
    }, [])

    const close = () => setTrackPanel({...trackPanel, active: false}) // Close track panel

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
                                    <Link href={'/artist/[id]'} as={`/artist/${track?.album?.artist?._id}`} onClick={close}>{track?.album?.artist?.name}</Link>
                                    &nbsp;—&nbsp;
                                    <Link href={'/album/[id]'} as={`/album/${track?.album?._id}`} onClick={close}>{track?.album?.title}</Link>
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
                                        <button className="no_focus">
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
                                        <button className="no_focus">
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
                        <div className={styles.lyrics}>
                            <span className={styles.noLyrics}>No lyrics to display.</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}