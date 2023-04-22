import Link from 'next/link'
import {LikeIcon} from '@/icons'
import styles from '@/styles/now-playing-bar.module.sass'

export default function NowPlayingBar() {
    return (
        <div className={styles.nowPlayingBar}>
            <div className={styles.track}>
                <div className={styles.trackImage}>
                    <Link href="/">
                        <img src="/album_cover.jpg" alt="Album Cover"/>
                    </Link>
                </div>
                <div className={styles.trackInfo}>
                    <div className={styles.trackName}>
                        <Link href="/">
                            Harvester Of Sorrow
                        </Link>
                    </div>
                    <div className={styles.trackArtist}>
                        <Link href="/">
                            Metallica
                        </Link>
                    </div>
                </div>
                <div className={styles.trackLike}>
                    <LikeIcon strokeWidth={12}/>
                </div>
            </div>
        </div>
    )
}