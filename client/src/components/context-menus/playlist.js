import axios from 'axios'
import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {ContextMenuContext} from '@/contexts/context-menu'
import {QueueContext} from '@/contexts/queue'
import {DialogueContext} from '@/contexts/dialogue'
import {LibraryContext} from '@/contexts/library'
import {
    DeleteIcon,
    LikeIcon,
    NextIcon,
    PersonIcon,
    PlayIcon,
    QueueIcon,
    ShareIcon
} from '@/icons'
import styles from '@/styles/context-menu.module.sass'

export default function PlaylistContextMenu({playlist}) {
    const router = useRouter() // Get router
    const [user] = useContext(AuthContext) // Get user from auth context
    const [contextMenu] = useContext(ContextMenuContext) // Get context menu state
    const {queue, queueIndex, setQueue, dontChangeRef, handlePlayPause} = useContext(QueueContext) // Get queue state from queue context
    const [, setDialogue] = useContext(DialogueContext) // Get setDialogue function from DialogueContext
    const [, , getUserLibrary] = useContext(LibraryContext) // Get library
    const [position, setPosition] = useState({x: -9999, y: -9999, subMenuReverse: false}) // Context menu position
    const [isLiked, setIsLiked] = useState(null) // Is playlist liked
    const menuRef = useRef() // Menu reference

    useEffect(() => {
        if (menuRef.current) setPosition({ // Set context menu position
            x: Math.max(20, contextMenu.x + menuRef.current?.clientWidth + 20 > window.innerWidth ? contextMenu.x - menuRef.current?.clientWidth : contextMenu.x),
            y: Math.max(20, contextMenu.y + menuRef.current?.clientHeight + 20 > window.innerHeight ? contextMenu.y - menuRef.current?.clientHeight : contextMenu.y),
            subMenuReverse: contextMenu.x + menuRef.current?.clientWidth + 200 > window.innerWidth
        })

        if (playlist?._id || playlist?.id) { // If playlist is exist
            axios.get(`${process.env.API_URL}/playlist/is-liked/${playlist?._id || playlist?.id}`, { // Get is playlist liked
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            }).then(res => {
                setIsLiked(!!res.data?.isLiked) // Set is playlist liked
                getUserLibrary() // Get user library
            }).catch(e => console.error(e))
        }
    }, [menuRef, contextMenu])

    const handlePlay = () => {
        const filteredTracks = playlist?.tracks.filter(t => !!t.audio) // Filter tracks
        if (!filteredTracks.length) return // If tracks is not exist, return
        setQueue([...queue.slice(0, queueIndex), ...filteredTracks, ...queue.slice(queueIndex)]) // Set queue to filtered tracks
        handlePlayPause(true) // Play tracks
    }

    const handleAddToQueue = () => { // Add track to the queue
        const filteredTracks = playlist?.tracks.filter(t => !!t.audio) // Filter tracks
        if (!filteredTracks.length) return // If tracks is not exist, return
        dontChangeRef.current = true // Set dontChangeRef to true
        setQueue([...queue.slice(0, queueIndex + 1), ...filteredTracks, ...queue.slice(queueIndex + 1)]) // Add track to the queue
    }

    const handleCopyLink = () => {
        if (!navigator.clipboard || (!playlist?.id && !playlist?._id)) return // If navigator clipboard is not exist or playlist is not exist, return
        navigator.clipboard.writeText(`${process.env.APP_URL}/playlist/${playlist?.id || playlist?._id}`) // Copy link to clipboard
    }

    const handleLike = () => {
        if (isLiked === null || playlist?.owner?._id === user?.id) return // If isLiked is null, return
        axios.post(`${process.env.API_URL}/playlist/like/${playlist?._id || playlist?.id}`, {
            like: isLiked ? -1 : 1
        }, { // Like or unlike playlist
            headers: {
                Authorization: `Bearer ${user?.token}`
            }
        }).then(res => {
            setIsLiked(res.data?.isLiked) // Set is playlist liked
            getUserLibrary() // Get user library
        }).catch(e => console.error(e))
    }

    const handleConfirmDelete = () => {
        setDialogue({
            active: true,
            title: 'Delete playlist',
            description: 'Are you sure you want to delete this playlist?',
            button: 'Delete',
            type: 'danger',
            callback: () => {
                axios.delete(`${process.env.API_URL}/playlist/${playlist?._id}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    }
                }).catch(e => console.error(e))
                getUserLibrary()
                router.push('/library')
            },
        })
    }

    return user?.loaded && user?.id && user?.token ? (
        <div className={styles.contextMenu} ref={menuRef} style={{
            top: position.y,
            left: position.x,
        }}>
            {playlist ? (
                <div className={`${styles.item} ${!playlist?.tracks?.filter(t => !!t.audio)?.length ? styles.disabled : ''}`} onClick={handlePlay}>
                    <PlayIcon rounded={true} fill={'#eee'}/>
                    <span className={styles.text}>Play</span>
                </div>
            ) : ''}
            <div className={`${styles.item} ${(!playlist?.tracks?.filter(t => !!t.audio)?.length || !queue?.length) ? styles.disabled : ''}`} onClick={handleAddToQueue}>
                <QueueIcon stroke={'#eee'}/>
                <span className={styles.text}>Add to queue</span>
            </div>
            {playlist?.owner?._id !== user?.id ? (
                <div className={`${styles.item} ${isLiked === null ? styles.disabled : ''}`} onClick={() => handleLike()}>
                    <LikeIcon stroke={'#eee'} fill={isLiked ? '#eee' : 'none'}/>
                    <span className={styles.text}>{
                        isLiked ? 'Remove from library' : 'Add to library'
                    }</span>
                </div>
            ) : ''}
            <div className={styles.separator}></div>
            {playlist?.owner?._id ? (
                <div className={styles.item} onClick={() => router.push('/profile/[id]', `/profile/${playlist?.owner?._id}`)}>
                    <PersonIcon stroke={'#eee'}/>
                    <span className={styles.text}>Go to creator</span>
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
            {playlist?.owner?._id === user?.id || user?.admin ? (
                <>
                    <div className={styles.separator}></div>
                    <div className={styles.item} onClick={handleConfirmDelete}>
                        <DeleteIcon stroke={'#eee'}/>
                        <span className={styles.text}>Delete</span>
                    </div>
                </>
            ) : ''}
        </div>
    ) : ''
}