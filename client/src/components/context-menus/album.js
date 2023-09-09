import axios from 'axios'
import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {ContextMenuContext} from '@/contexts/context-menu'
import {QueueContext} from '@/contexts/queue'
import {LibraryContext} from '@/contexts/library'
import {
    LikeIcon,
    NextIcon,
    PersonIcon,
    PlayIcon,
    QueueIcon,
    ShareIcon
} from '@/icons'
import styles from '@/styles/context-menu.module.sass'

export default function AlbumContextMenu({album}) {
    const router = useRouter() // Get router
    const [user] = useContext(AuthContext) // Get user from auth context
    const [contextMenu] = useContext(ContextMenuContext) // Get context menu state
    const {queue, queueIndex, setQueue, dontChangeRef, handlePlayPause} = useContext(QueueContext) // Get queue state from queue context
    const [, , getUserLibrary] = useContext(LibraryContext) // Get library
    const [position, setPosition] = useState({x: -9999, y: -9999, subMenuReverse: false}) // Context menu position
    const [isLiked, setIsLiked] = useState(null) // Is album liked
    const [tracks, setTracks] = useState([]) // Tracks
    const menuRef = useRef() // Menu reference

    useEffect(() => {
        if (menuRef.current) setPosition({ // Set context menu position
            x: Math.max(20, contextMenu.x + menuRef.current?.clientWidth + 20 > window.innerWidth ? contextMenu.x - menuRef.current?.clientWidth : contextMenu.x),
            y: Math.max(20, contextMenu.y + menuRef.current?.clientHeight + 20 > window.innerHeight ? contextMenu.y - menuRef.current?.clientHeight : contextMenu.y),
            subMenuReverse: contextMenu.x + menuRef.current?.clientWidth + 200 > window.innerWidth
        })

        if (album?._id || album?.id) { // If album is exist
            axios.get(`${process.env.API_URL}/album/is-liked/${album?._id || album?.id}`, { // Get is album liked
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            }).then(res => {
                setIsLiked(!!res.data?.isLiked) // Set is album liked
                getUserLibrary() // Get user library
            }).catch(e => console.error(e))

            if (!album?.tracks?.length)
                axios.get(`${process.env.API_URL}/track/album/${album?._id || album?.id}?onlyAudio=1`).then(res => { // Get tracks by album
                    setTracks(res.data?.tracks) // Set tracks
                }).catch(e => console.error(e))
        }
    }, [menuRef, contextMenu])

    const handlePlay = () => {
        const filteredTracks = (album?.tracks?.length ? album?.tracks : tracks).filter(t => !!t.audio) // Filter tracks
        if (!filteredTracks.length) return // If tracks is not exist, return
        setQueue([...queue.slice(0, queueIndex), ...filteredTracks, ...queue.slice(queueIndex)]) // Set queue to filtered tracks
        handlePlayPause(true) // Play tracks
    }

    const handleAddToQueue = () => { // Add track to the queue
        const filteredTracks = (album?.tracks?.length ? album?.tracks : tracks).filter(t => !!t.audio) // Filter tracks
        if (!filteredTracks.length) return // If tracks is not exist, return
        dontChangeRef.current = true // Set dontChangeRef to true
        setQueue([...queue.slice(0, queueIndex + 1), ...filteredTracks, ...queue.slice(queueIndex + 1)]) // Add track to the queue
    }

    const handleCopyLink = () => {
        if (!album?.id && !album?._id) return // If navigator clipboard is not exist or album is not exist, return
        if (navigator?.clipboard) navigator.clipboard.writeText(`${process.env.APP_URL}/album/${album?.id || album?._id}`) // Copy link to clipboard
        else if (document) {
            const el = document.createElement('textarea') // Create textarea
            el.value = `${process.env.APP_URL}/album/${album?.id || album?._id}` // Set textarea value
            document.body.appendChild(el) // Append textarea to body
            el.select() // Select textarea
            document.execCommand('copy') // Copy link to clipboard
            document.body.removeChild(el) // Remove textarea from body
        }
    }

    const handleLike = () => {
        if (isLiked === null || album?.owner?._id === user?.id) return // If isLiked is null, return
        axios.post(`${process.env.API_URL}/album/like/${album?._id || album?.id}`, {
            like: isLiked ? -1 : 1
        }, { // Like or unlike album
            headers: {
                Authorization: `Bearer ${user?.token}`
            }
        }).then(res => {
            setIsLiked(res.data?.isLiked) // Set is album liked
            getUserLibrary() // Get user library
        }).catch(e => console.error(e))
    }

    return user?.loaded && user?.id && user?.token ? (
        <div className={styles.contextMenu} ref={menuRef} style={{
            top: position.y,
            left: position.x,
        }}>
            {album ? (
                <div className={`${styles.item} ${!(album?.tracks?.length ? album?.tracks : tracks)?.filter(t => !!t.audio)?.length ? styles.disabled : ''}`} onClick={handlePlay}>
                    <PlayIcon rounded={true} fill={'#eee'}/>
                    <span className={styles.text}>Play</span>
                </div>
            ) : ''}
            <div className={`${styles.item} ${(!(album?.tracks?.length ? album?.tracks : tracks)?.filter(t => !!t.audio)?.length || !queue?.length) ? styles.disabled : ''}`} onClick={handleAddToQueue}>
                <QueueIcon stroke={'#eee'}/>
                <span className={styles.text}>Add to queue</span>
            </div>
            {album?.owner?._id !== user?.id ? (
                <div className={`${styles.item} ${isLiked === null ? styles.disabled : ''}`} onClick={() => handleLike()}>
                    <LikeIcon stroke={'#eee'} fill={isLiked ? '#eee' : 'none'}/>
                    <span className={styles.text}>{
                        isLiked ? 'Remove from library' : 'Add to library'
                    }</span>
                </div>
            ) : ''}
            <div className={styles.separator}></div>
            {album?.artist?._id ? (
                <div className={styles.item} onClick={() => router.push('/artist/[id]', `/artist/${album?.artist?._id}`)}>
                    <PersonIcon stroke={'#eee'}/>
                    <span className={styles.text}>Go to artist</span>
                </div>
            ) : ''}
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