import {useState} from 'react'
import Tracks from '@/components/tracks'
import styles from '@/styles/extensible-tracks.module.sass'

export default function ExtensibleTracks({title = '', items = [], likedTracks = null, set = () => {}}) {
    const [showMore, setShowMore] = useState(false)

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>{title}</h2>
                {items?.length > 5 && (
                    <button className={styles.button} onClick={() => setShowMore(!showMore)}>
                        {showMore ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>
            <Tracks items={[showMore ? items : items.slice(0, 5), items, likedTracks, set]} noPadding={true}/>
            {showMore && (
                <div className={styles.footer}>
                    <button className={styles.button} onClick={() => setShowMore(!showMore)}>
                        Show less
                    </button>
                </div>
            )}
        </div>
    )
}