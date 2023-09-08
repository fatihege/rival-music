import axios from 'axios'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {ContextMenuContext} from '@/contexts/context-menu'
import {QueueContext} from '@/contexts/queue'
import {
    LikeIcon,
    NextIcon,
    PlayIcon,
    QueueIcon,
    ShareIcon
} from '@/icons'
import styles from '@/styles/context-menu.module.sass'

export default function ArtistContextMenu({artist}) {
    const [user] = useContext(AuthContext) // Get user from auth context
    const [contextMenu] = useContext(ContextMenuContext) // Get context menu state
    const {queue, queueIndex, setQueue, dontChangeRef, handlePlayPause} = useContext(QueueContext) // Get queue state from queue context
    const [position, setPosition] = useState({x: -9999, y: -9999, subMenuReverse: false}) // Context menu position
    const [isFollowed, setIsFollowed] = useState(null) // Is artist followed by user
    const [tracks, setTracks] = useState([]) // Tracks
    const menuRef = useRef() // Menu reference

    useEffect(() => {
        if (menuRef.current) setPosition({ // Set context menu position
            x: Math.max(20, contextMenu.x + menuRef.current?.clientWidth + 20 > window.innerWidth ? contextMenu.x - menuRef.current?.clientWidth : contextMenu.x),
            y: Math.max(20, contextMenu.y + menuRef.current?.clientHeight + 20 > window.innerHeight ? contextMenu.y - menuRef.current?.clientHeight : contextMenu.y),
            subMenuReverse: contextMenu.x + menuRef.current?.clientWidth + 200 > window.innerWidth
        })

        if (artist?._id || artist?.id) { // If artist is exist
            axios.get(`${process.env.API_URL}/artist/is-followed/${artist?._id || artist?.id}`, { // Get is artist followed
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            }).then(res => {
                setIsFollowed(!!res.data?.isFollowed) // Set is artist followed
            }).catch(e => console.error(e))

            if (!artist?.tracks?.length)
                axios.get(`${process.env.API_URL}/artist/essentials/${artist?._id || artist?.id}?only=tracks`).then(res => { // Get tracks by artist
                    setTracks(res.data?.essentials?.mostListenedTracks) // Set tracks
                }).catch(e => console.error(e))
        }
    }, [menuRef, contextMenu])

    const handlePlay = () => {
        const filteredTracks = (artist?.tracks?.length ? artist?.tracks : tracks).filter(t => !!t.audio) // Filter tracks
        if (!filteredTracks.length) return // If tracks is not exist, return
        setQueue([...queue.slice(0, queueIndex), ...filteredTracks, ...queue.slice(queueIndex)]) // Set queue to filtered tracks
        handlePlayPause(true) // Play tracks
    }

    const handleAddToQueue = () => { // Add track to the queue
        const filteredTracks = (artist?.tracks?.length ? artist?.tracks : tracks).filter(t => !!t.audio) // Filter tracks
        if (!filteredTracks.length) return // If tracks is not exist, return
        dontChangeRef.current = true // Set dontChangeRef to true
        setQueue([...queue.slice(0, queueIndex + 1), ...filteredTracks, ...queue.slice(queueIndex + 1)]) // Add track to the queue
    }

    const handleCopyLink = () => {
        if (!navigator.clipboard || (!artist?.id && !artist?._id)) return // If navigator clipboard is not exist or artist is not exist, return
        navigator.clipboard.writeText(`${process.env.APP_URL}/artist/${artist?.id || artist?._id}`) // Copy link to clipboard
    }

    const handleFollow = () => {
        if (isFollowed === null) return // If isFollowed is null, return
        axios.post(`${process.env.API_URL}/user/follow/artist/${artist?._id || artist?.id}`, { // Send POST request to the API
            follow: isFollowed ? -1 : 1 // Follow or unfollow artist
        }, {
            headers: {
                Authorization: `Bearer ${user?.token}`
            }
        }).then(res => {
            setIsFollowed(res.data?.isFollowed) // Set is artist followed
        }).catch(e => console.error(e))
    }

    return user?.loaded && user?.id && user?.token ? (
        <div className={styles.contextMenu} ref={menuRef} style={{
            top: position.y,
            left: position.x,
        }}>
            {artist ? (
                <div className={`${styles.item} ${!(artist?.tracks?.length ? artist?.tracks : tracks)?.filter(t => !!t.audio)?.length ? styles.disabled : ''}`} onClick={handlePlay}>
                    <PlayIcon rounded={true} fill={'#eee'}/>
                    <span className={styles.text}>Play</span>
                </div>
            ) : ''}
            <div className={`${styles.item} ${(!(artist?.tracks?.length ? artist?.tracks : tracks)?.filter(t => !!t.audio)?.length || !queue?.length) ? styles.disabled : ''}`} onClick={handleAddToQueue}>
                <QueueIcon stroke={'#eee'}/>
                <span className={styles.text}>Add to queue</span>
            </div>
            <div className={`${styles.item} ${isFollowed === null ? styles.disabled : ''}`} onClick={() => handleFollow()}>
                <LikeIcon stroke={'#eee'} fill={isFollowed ? '#eee' : 'none'}/>
                <span className={styles.text}>{
                    isFollowed ? 'Unfollow' : 'Follow'
                }</span>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.item}>
                <ShareIcon stroke={'#eee'}/>
                <span className={styles.text}>Share</span>
                <span className={styles.hasSub}>
                    <NextIcon/>
                </span>
                <div className={`${styles.subMenu} ${position.subMenuReverse ? styles.reverse : ''}`}>
                    <div className={styles.item} onClick={handleCopyLink}>
                        <span>Copy link</span>
                    </div>
                </div>
            </div>
        </div>
    ) : ''
}