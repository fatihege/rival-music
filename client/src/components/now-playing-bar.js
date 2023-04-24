import Link from 'next/link'
import {LikeIcon, NextTrackIcon, PlayIcon, PrevTrackIcon, RepeatIcon, ShuffleIcon, VolumeHighIcon} from '@/icons'
import styles from '@/styles/now-playing-bar.module.sass'

export default function NowPlayingBar() {
    return (
        <div className={styles.nowPlayingBar}>
            <div className={styles.nowPlayingBarWrapper}>
                <div className={styles.track}>
                    <div className={styles.trackImage}>
                        <img src="/album_cover_1.jpg" alt="Album Cover"/>
                    </div>
                    <div className={styles.trackInfo}>
                        <div className={styles.trackName}>
                            <Link href="/">
                                Seek & Destroy - Remaster
                            </Link>
                        </div>
                        <div className={styles.trackArtist}>
                            <Link href="/">
                                Metallica
                            </Link>
                        </div>
                    </div>
                    <button className={styles.trackLike}>
                        <LikeIcon strokeWidth={12}/>
                    </button>
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
            </div>
        </div>
    )
}