import Head from 'next/head'
import Link from 'next/link'
import {useContext, useEffect, useState} from 'react'
import {TrackPanelContext} from '@/pages/_app'
import Player from '@/components/player'
import {CloseIcon, PlayIcon, RepeatIcon, ShuffleIcon, PanelPrevTrackIcon, PanelNextTrackIcon} from '@/icons'
import styles from '@/styles/track-panel.module.sass'

export default function TrackPanel() {
    const ALBUM_IMAGE = '/album_cover_6.jpg'
    const [trackPanel, setTrackPanel] = useContext(TrackPanelContext) // Track panel state
    const [fade, setFade] = useState(false) // Can the panel fade in

    useEffect(() => {
        setFade(true) // Fade in panel
    }, [])

    return (
        <>
            <Head>
                <title>Creeping Death - Remastered • Rival Music</title>
            </Head>
            <div className={`${styles.container} ${fade ? styles.fadeIn : ''}`}>
                <div className={styles.background}>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="100%" height="100%">
                        <filter id="displacementFilter">
                            <feTurbulence type="turbulence" baseFrequency=".01 .01"
                                          numOctaves="4" result="turbulence" seed="10"/>
                            <feDisplacementMap in2="turbulence" in="SourceGraphic"
                                               scale="60" xChannelSelector="R" yChannelSelector="B"/>
                        </filter>
                        <image href={ALBUM_IMAGE} width="110%" height="110%" x="-20" y="-20" preserveAspectRatio="none"
                               filter="url(#displacementFilter)"/>
                        <image href={ALBUM_IMAGE} width="60%" height="50%" x="40%" y="-20" preserveAspectRatio="none"
                               filter="url(#displacementFilter)"/>
                        <image href={ALBUM_IMAGE} width="50%" height="50%" x="-10%" y="40%" preserveAspectRatio="none"
                               filter="url(#displacementFilter)"/>
                    </svg>
                </div>
                <div className={styles.wrapper}>
                    <div className={styles.close} onClick={() => setTrackPanel({...trackPanel, active: false})}>
                        <CloseIcon strokeWidth={24}/>
                    </div>
                    <div className={styles.innerContainer}>
                        <div className={styles.controls}>
                            <div className={styles.albumCover}>
                                <img src={ALBUM_IMAGE} alt="Album Cover"/>
                            </div>
                            <div className={styles.trackInfo}>
                                <div className={styles.trackTitle}>Creeping Death - Remastered</div>
                                <div className={styles.trackArtistAndAlbum}>
                                    <Link href="/">Metallica</Link> — <Link href="/">Ride The Lightning (Remastered)</Link>
                                </div>
                            </div>
                            <div className={styles.player}>
                                <div className={styles.playerControls}>
                                    <button>
                                        <RepeatIcon strokeRate={1.5}/>
                                    </button>
                                    <button>
                                        <PanelPrevTrackIcon/>
                                    </button>
                                    <button>
                                        <PlayIcon/>
                                    </button>
                                    <button>
                                        <PanelNextTrackIcon/>
                                    </button>
                                    <button>
                                        <ShuffleIcon strokeRate={1.5}/>
                                    </button>
                                </div>
                                <Player duration={6 * 60 + 36} type="full"/>
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