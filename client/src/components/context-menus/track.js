import axios from 'axios'
import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {ContextMenuContext} from '@/contexts/context-menu'
import {AlertContext} from '@/contexts/alert'
import {QueueContext} from '@/contexts/queue'
import {LibraryContext} from '@/contexts/library'
import {
    DeleteIcon,
    DiscIcon,
    LikeIcon,
    NextIcon,
    PersonIcon,
    PlayIcon,
    PlaylistIcon,
    QueueIcon,
    ShareIcon
} from '@/icons'
import styles from '@/styles/context-menu.module.sass'

export default function TrackContextMenu({tracks, playlist: [playlist, setPlaylist] = [], album, toggleLikeTrack}) {
    const router = useRouter() // Get router
    const [user] = useContext(AuthContext) // Get user from auth context
    const [contextMenu] = useContext(ContextMenuContext) // Get context menu state
    const [, setAlert] = useContext(AlertContext) // Get set alert function from alert context
    const {queue, queueIndex, setQueue, dontChangeRef, handlePlayPause} = useContext(QueueContext) // Get queue state from queue context
    const [library, , getUserLibrary] = useContext(LibraryContext) // Get library
    const [position, setPosition] = useState({x: -9999, y: -9999, subMenuReverse: false}) // Context menu position
    const [isLiked, setIsLiked] = useState(false) // Is track liked
    const menuRef = useRef() // Menu reference

    useEffect(() => {
        if (menuRef.current) setPosition({ // Set context menu position
            x: Math.max(20, contextMenu.x + menuRef.current?.clientWidth + 20 > window.innerWidth ? contextMenu.x - menuRef.current?.clientWidth : contextMenu.x),
            y: Math.max(20, contextMenu.y + menuRef.current?.clientHeight + 20 > window.innerHeight ? contextMenu.y - menuRef.current?.clientHeight : contextMenu.y),
            subMenuReverse: contextMenu.x + menuRef.current?.clientWidth + 200 > window.innerWidth
        })
    }, [menuRef, contextMenu])

    useEffect(() => {
        if (tracks?.length !== 1) {
            setIsLiked(null) // Set isLiked state
            return
        }

        if (playlist) setIsLiked(playlist?.likes?.includes(tracks[0]?._id)) // Set isLiked state
        else if (album) setIsLiked(album?.likes?.includes(tracks[0]?._id)) // Set isLiked state
        else if (tracks?.length === 1) setIsLiked(!!tracks[0]?.liked) // Set isLiked state
    }, [tracks, playlist, album])

    const handleAddPlaylist = async (playlistId) => {
        try {
            await axios.post(`${process.env.API_URL}/playlist/add-tracks/${playlistId}`, {tracks}, { // Add tracks to playlist
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })
        } catch (err) {
            console.error(err)
        }
    }

    const handleCreatePlaylist = () => {
        axios.post(`${process.env.API_URL}/playlist/create`, {}, { // Create playlist
            headers: {
                Authorization: `Bearer ${user?.token}`,
            }
        }).then(res => {
            axios.post(`${process.env.API_URL}/playlist/add-tracks/${res.data?.id}`, {tracks}, { // Add tracks to playlist
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                }
            }).catch(e => console.error(e))
            if (res.data?.status === 'OK') { // If status is OK
                router.push('/playlist/[id]', `/playlist/${res.data?.id}`) // Go to playlist
                getUserLibrary() // Get user library
            }
        }).catch(e => {
            console.error(e)
            setAlert({
                active: true,
                title: 'An error occurred',
                description: 'An error occurred while creating the playlist',
                button: 'OK',
                type: '',
            })
        })
    }

    const handlePlay = () => {
        const filteredTracks = tracks.filter(t => !!t.audio) // Filter tracks
        if (!filteredTracks.length) return // If tracks is not exist, return
        setQueue([...queue.slice(0, queueIndex), ...filteredTracks, ...queue.slice(queueIndex)]) // Play tracks
        handlePlayPause(true) // Play tracks
    }

    const handleAddToQueue = () => { // Add track to the queue
        const filteredTracks = tracks.filter(t => !!t.audio) // Filter tracks
        if (!filteredTracks.length) return // If tracks is not exist, return
        dontChangeRef.current = true // Set dontChangeRef to true
        setQueue([...queue.slice(0, queueIndex + 1), ...filteredTracks, ...queue.slice(queueIndex + 1)]) // Add track to the queue
    }

    const handleRemoveFromPlaylist = async () => {
        if (!playlist) return // If playlist is not exist, return
        try {
            await axios.post(`${process.env.API_URL}/playlist/remove-tracks/${playlist._id}`, {
                tracks: typeof tracks[0] !== 'string' ? tracks.map(t => t._id) : tracks
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })

            setPlaylist({
                ...playlist,
                tracks: playlist.tracks.filter(t => !tracks.map(tr => tr._id).includes(t._id))
            })
        } catch (err) {
            console.error(err)
        }
    }

    const handleCopyLink = () => {
        if (tracks.length > 1) return // If tracks length is more than 1, return
        const track = tracks[0]
        const albumId = playlist ? track?.album?._id : album ? album?._id : track?.album?._id // Get album id
        if (!navigator.clipboard || !track?._id || !albumId) return // If navigator clipboard is not exist or track is not exist, return
        navigator.clipboard.writeText(`${process.env.APP_URL}/album/${albumId}#${track?._id}`) // Copy link to clipboard
    }

    return user?.loaded && user?.id && user?.token ? (
        <div className={styles.contextMenu} ref={menuRef} style={{
            top: position.y,
            left: position.x,
        }}>
            {playlist || album ? (
                <div className={`${styles.item} ${!tracks.filter(t => !!t.audio)?.length ? styles.disabled : ''}`} onClick={handlePlay}>
                    <PlayIcon rounded={true} fill={'#eee'}/>
                    <span className={styles.text}>Play</span>
                </div>
            ) : ''}
            <div className={styles.item}>
                <PlaylistIcon stroke={'#eee'}/>
                <span className={styles.text}>Add to playlist</span>
                <span className={styles.hasSub}>
                    <NextIcon/>
                </span>
                <div className={`${styles.subMenu} ${position.subMenuReverse ? styles.reverse : ''}`}>
                    {library?.playlists ? library.playlists?.map(pl => (pl._id !== playlist?._id) || !playlist ? (
                        <div className={styles.item} key={pl._id} onClick={() => handleAddPlaylist(pl._id)}>
                            <span>{pl.title}</span>
                        </div>
                    ) : '') : ''}
                    {library?.playlists?.length > 1 && (
                        <div className={styles.separator}></div>
                    )}
                    <div className={styles.item} onClick={handleCreatePlaylist}>
                        <span>Create playlist</span>
                    </div>
                </div>
            </div>
            <div className={`${styles.item} ${!tracks.filter(t => !!t.audio)?.length ? styles.disabled : ''}`} onClick={handleAddToQueue}>
                <QueueIcon stroke={'#eee'}/>
                <span className={styles.text}>Add to queue</span>
            </div>
            {tracks?.length === 1 && toggleLikeTrack ? (
                <div className={styles.item} onClick={() => toggleLikeTrack(tracks[0]?._id || tracks[0]?.id)}>
                    <LikeIcon stroke={'#eee'} fill={isLiked ? '#eee' : 'none'}/>
                    <span className={styles.text}>{
                        isLiked ? 'Remove from library' : 'Add to library'
                    }</span>
                </div>
            ) : ''}
            {playlist ? (
                <div className={styles.item} onClick={handleRemoveFromPlaylist}>
                    <DeleteIcon stroke={'#eee'}/>
                    <span className={styles.text}>Remove from playlist</span>
                </div>
            ) : ''}
            <div className={styles.separator}></div>
            {tracks?.length === 1 ? (
                <>
                    {tracks[0]?.album?._id ? (
                        <div className={styles.item} onClick={() => router.push('/album/[id]', `/album/${tracks[0]?.album?._id}`)}>
                            <DiscIcon stroke={'#eee'}/>
                            <span className={styles.text}>Go to album</span>
                        </div>
                    ) : ''}
                    <div className={styles.item} onClick={() => router.push('/artist/[id]', `/artist/${playlist ? tracks[0]?.album?.artist?._id : album ? album?.artist?._id : tracks[0]?.album?.artist ? tracks[0]?.album?.artist?._id : ''}`)}>
                        <PersonIcon stroke={'#eee'}/>
                        <span className={styles.text}>Go to artist</span>
                    </div>
                </>
            ) : ''}
            <div className={`${styles.item} ${tracks?.length > 1 ? styles.disabled : ''}`}>
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