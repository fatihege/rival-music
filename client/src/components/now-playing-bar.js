import Link from 'next/link'
import {useContext, useEffect, useState} from 'react'
import {NPBarResizingContext} from '@/pages/_app'
import {LikeIcon, NextTrackIcon, PlayIcon, PrevTrackIcon, RepeatIcon, ShuffleIcon, VolumeHighIcon} from '@/icons'
import styles from '@/styles/now-playing-bar.module.sass'

export default function NowPlayingBar() {
    const [, setIsResizing] = useContext(NPBarResizingContext)
    const [width, setWidth] = useState(null)
    const [MAX_WIDTH, setMaxWidth] = useState(null)
    const MIN_WIDTH = 700
    const HIDING_BREAKPOINT = 800

    // TODO: Remove this
    let ran = false
    useEffect(() => {
        if (ran) return
        ran = true

        setMaxWidth(window.innerWidth - 48)

        window.addEventListener('resize', () => {
            setMaxWidth(window.innerWidth - 48)
        })
    })

    useEffect(() => {
        if (!width) setWidth(MAX_WIDTH)
    }, [MAX_WIDTH])

    const handleResize = (e, side) => setIsResizing({
        active: true,
        side,
        MIN_WIDTH,
        MAX_WIDTH,
        offset: MAX_WIDTH - e.clientX,
        setWidth,
    })

    return (
        <div className={styles.nowPlayingBar} style={{width: `${Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH)}px`}}>
            <div className={styles.nowPlayingBarWrapper}>
                <div className={`${styles.layoutResizer} ${styles.left}`} onMouseDown={e => handleResize(e, 1)}></div>
                <div className={styles.track}>
                    <div className={styles.trackImage}>
                        <img src="/album_cover_1.jpg" alt="Album Cover"/>
                    </div>
                    <div className={styles.trackInfo}>
                        <div className={styles.trackName}>
                            <Link href="/" className={width < HIDING_BREAKPOINT ? 'hide' : ''}>
                                Seek & Destroy - Remaster
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
                    <div className={styles.trackTimeline}>
                        <div className={styles.timeText}>3:28</div>
                        <div className={styles.progressBarWrapper}>
                            <div className={styles.progressBar}>
                                <div className={styles.progress}>
                                    <div className={styles.button}></div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.timeText}>6:55</div>
                    </div>
                </div>
                <div className={styles.otherControls}>
                    <button className={styles.volume}>
                        <VolumeHighIcon/>
                    </button>
                    <div className={styles.separator}></div>
                    <div className={styles.queue}>
                        <div className={styles.queueImage}>
                            <img src="/album_cover_2.jpg" alt=""/>
                        </div>
                        <div className={styles.queueText}>Queue</div>
                    </div>
                </div>
                <div className={`${styles.layoutResizer} ${styles.right}`} onMouseDown={e => handleResize(e, 2)}></div>
            </div>
        </div>
    )
}