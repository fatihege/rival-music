import axios from 'axios'
import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import Skeleton from 'react-loading-skeleton'
import {AuthContext} from '@/contexts/auth'
import {QueueContext} from '@/contexts/queue'
import {ContextMenuContext} from '@/contexts/context-menu'
import {ModalContext} from '@/contexts/modal'
import Link from '@/components/link'
import Image from '@/components/image'
import {TooltipHandler} from '@/components/tooltip'
import TrackContextMenu from '@/components/context-menus/track'
import AskLoginModal from '@/components/modals/ask-login'
import formatTime from '@/utils/format-time'
import {AlbumDefault, DiscIcon, ExplicitIcon, LikeIcon, OptionsIcon, PauseIcon, PlayIcon} from '@/icons'
import styles from '@/styles/tracks.module.sass'

export const handlePlay = (id = null, user, list, setModal, queue, setQueue, queueIndex, setQueueIndex, handlePlayPause, items = null, type = null) => {
    if (!user || !user?.id || !user?.token) return setModal({ // If track ID is not defined or user is not logged in, open ask login modal
        active: <AskLoginModal/>,
        canClose: true,
    })

    const tracks = items?.[1] || list?.tracks // Get tracks
    if (id && !tracks?.find(t => t._id === id)?.audio) return // If track ID is defined and track audio is not exists, return

    if (id && queue?.length && queue?.findIndex(t => t.id === id) === queueIndex) { // If track ID is defined and track is already in the queue
        handlePlayPause(true) // Play track
        return
    }

    const filteredTracks = tracks?.filter(t => !!t.audio) // Filter tracks that have audio
    const index = id ? filteredTracks?.findIndex(t => t._id === id) : 0

    setQueue(filteredTracks?.map(t => ({id: t._id, audio: t.audio})) || []) // Set queue to the list tracks
    setQueueIndex(index) // Set queue index to the track index
    handlePlayPause(true) // Play track

    if (type && type === 'playlist')
        axios.post(`${process.env.API_URL}/playlist/play/${list._id}`, {}, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            }
        }).catch(e => console.error(e))
}

export default function Tracks({playlist, album, items, noPadding = false}) {
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get user data from AuthContext
    const {
        queue,
        setQueue,
        queueIndex,
        setQueueIndex,
        isPlaying,
        handlePlayPause,
        track: contextTrack,
        setIsLiked,
    } = useContext(QueueContext) // Get queue data from QueueContext
    const [, setModal] = useContext(ModalContext) // Get setModal function from ModalContext
    const [, setContextMenu] = useContext(ContextMenuContext) // Get setContextMenu function from ContextMenuContext
    const [clickedItems, _setClickedItems] = useState(null) // Clicked items state
    const [selectedTracks, setSelectedTracks] = useState([]) // Selected tracks
    const [dragItems, _setDragItems] = useState(null) // Drag items state
    const clickedItemsRef = useRef(clickedItems) // Clicked items reference
    const dragItemsRef = useRef(dragItems) // Drag items reference
    const dragPreviewRef = useRef() // Drag preview reference

    const setClickedItems = value => {
        clickedItemsRef.current = value
        _setClickedItems(value)
    }

    const setDragItems = value => {
        dragItemsRef.current = value
        _setDragItems(value)
    }

    useEffect(() => {
        const mouseMove = e => {
            if (!dragItemsRef.current?.length) return // If drag item is not exist, return
            dragPreviewRef.current.style.top = `${e.clientY}px` // Set drag preview top position
            dragPreviewRef.current.style.left = `${e.clientX}px` // Set drag preview left position
        }

        const mouseUp = () => {
            setClickedItems(null)
            setDragItems(null)
        }

        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)

        return () => {
            document.removeEventListener('mousemove', mouseMove)
            document.removeEventListener('mouseup', mouseUp)
            setSelectedTracks([]) // Reset selected tracks
        }
    }, [])

    useEffect(() => {
        const hash = router?.asPath?.split('#')[1] // Get hash from URL
        if (hash) setSelectedTracks([hash]) // If hash is defined, set selected tracks to the hash
    }, [router.asPath])

    const handleSelectTrack = (e, id) => {
        if (e.button !== 0) return // If mouse button is not left, return
        const list = playlist?.length ? playlist[0] : album?.length ? album[0] : {tracks: items[0]} // Get list data

        if (e.ctrlKey || e.metaKey) {
            if (selectedTracks.includes(id)) setSelectedTracks(selectedTracks.filter(t => t !== id))
            else setSelectedTracks([...selectedTracks, id])
        } else if (e.shiftKey) {
            const tracks = list?.tracks?.filter(t => t?.audio)?.map(t => t?._id)
            const firstIndex = tracks?.indexOf(selectedTracks[0])
            const lastIndex = tracks?.indexOf(id)
            const selected = tracks?.slice(Math.min(firstIndex, lastIndex), Math.max(firstIndex, lastIndex) + 1)
            setSelectedTracks(selected)
        } else if (selectedTracks?.includes(id)) setSelectedTracks([])
        else setSelectedTracks([id])
    }

    const handleContextMenu = (e, _tracks) => {
        e.preventDefault()
        e.stopPropagation()

        const list = playlist?.length ? playlist[0] : album?.length ? album[0] : {tracks: items[0]} // Get list data
        const tracks = [] // Tracks array
        if (typeof _tracks[0] === 'string') {
            _tracks.map(t => {
                const foundTrack = list.tracks.find(tr => tr._id === t)
                if (foundTrack) tracks.push(foundTrack)
            })
        } else tracks.push(_tracks[0])

        setContextMenu({
            menu: <TrackContextMenu tracks={tracks} likedTracks={items?.[2]} playlist={playlist?.length ? playlist : []} album={album?.length ? album[0] : null} toggleLikeTrack={toggleLikeTrack}/>,
            x: e.clientX,
            y: e.clientY,
        })
    }

    const toggleLikeTrack = async (trackId) => {
        const list = playlist?.length ? playlist : album?.length ? album : items // Get list data
        if (!trackId || (!items?.length && !list[0]?.tracks?.find(t => t._id === trackId)?.audio)) return // If track ID is not defined or track audio is not exists, return
        if (!user?.id || !user?.token) return setModal({ // If track ID is not defined or user is not logged in, open ask login modal
            active: <AskLoginModal/>,
            canClose: true,
        })

        const liked = !items?.length ? list[0]?.likes?.includes(trackId) : !!items[2]?.find(t => t._id === trackId) // Check if track is liked
        const response = await axios.post(`${process.env.API_URL}/track/like/${trackId}`, { // Send POST request to the API
            like: liked ? -1 : 1,
        }, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            }
        })

        if (response.data?.status === 'OK') { // If there is a response
            const updatedList = {...list[0]} // Create updated list data
            if (response.data?.liked && !updatedList?.likes?.includes(trackId)) updatedList?.likes?.push(trackId) // If track is liked, push track ID to the likes array
            else if (updatedList?.likes) updatedList.likes = updatedList?.likes?.filter(t => t !== trackId) // Otherwise, remove track ID from the likes array
            if (!items?.length) list[1](updatedList) // Set list data to the updated list data
            else items[3](prev => prev?.lastListenedTracks ? ({
                ...prev,
                lastListenedTracks: prev.lastListenedTracks.map(t => ({
                    ...t,
                    liked: t._id === trackId ? response.data?.liked : t.liked,
                }))
            }) : !Array.isArray(prev) ? ({
                ...prev,
                tracks: response.data?.liked ? [...prev?.tracks, items[0].find(t => t._id === trackId)] : prev?.tracks?.filter(t => t._id !== trackId)
            }) : ([
                ...prev.map(p => ({
                    ...p,
                    liked: p._id === trackId ? response.data?.liked : p.liked,
                }))
            ])) // Set list data to the updated list data

            if (contextTrack && contextTrack._id === trackId) setIsLiked(response.data?.liked) // If track is defined and track ID is equal to the liked track ID, set isLiked state to the response data
        }
    }

    const handleMouseDown = (e, track) => {
        if (!playlist?.length) return // If playlist is not exist, return
        e.preventDefault()
        e.stopPropagation()

        if (e.button !== 0) return // If mouse button is not left, return

        if (selectedTracks?.length && selectedTracks?.includes(track?._id)) setDragItems(selectedTracks.map(t => playlist[0]?.tracks?.find(tr => tr?._id === t))) // If selected tracks is exist, set drag items reference to the selected tracks
        else setClickedItems([track]) // Otherwise, set clicked reference to the track
    }

    const dragStart = track => {
        if (!playlist?.length) return // If playlist is not exist, return
        if (clickedItemsRef.current?.length && clickedItemsRef.current.find(t => t?._id === track?._id) && !dragItemsRef.current) setDragItems(clickedItemsRef.current) // If clicked reference is exist and drag items reference is not exist, set drag items reference to the clicked reference
    }

    const dragEnd = track => {
        if (!playlist?.length) return // If playlist is not exist, return
        if (!dragItemsRef.current?.length) return // If drag items reference is not exist, return
        const index = playlist[0]?.tracks?.findIndex(t => t?._id === dragItemsRef.current[0]?._id) // Get index of drag item
        if (index === -1 || dragItemsRef.current?.find(t => t?._id === track?._id)) return // If index is -1 or drag items reference is exist, return

        const newPlaylist = [...playlist[0]?.tracks?.filter(t => !dragItemsRef.current?.find(d => d?._id === t?._id))] // Create new playlist without drag items
        const newIndex = playlist[0]?.tracks?.findIndex(t => t?._id === track?._id) // Get index of drop item

        newPlaylist.splice(newIndex, 0, ...dragItemsRef.current) // Add drag item to new playlist
        playlist[1]({...playlist[0], tracks: newPlaylist}) // Set playlist to the new playlist
        setDragItems(null) // Reset drag items
        setClickedItems(null) // Reset clicked items

        axios.post(`${process.env.API_URL}/playlist/reorder/${playlist[0]?._id}`, { // Send POST request to the API
            tracks: newPlaylist.map(t => t?._id),
        }, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            }
        }).catch(e => console.error(e))
    }

    return (
        <>
            {playlist?.length ? (
                <div className={`${styles.dragPreview} ${dragItems ? styles.show : ''}`} ref={dragPreviewRef}>
                    {dragItems?.length ? (
                        <>
                            <Image src={dragItems[0]?.album?.cover} alt={dragItems[0]?.title} width={40} height={40}
                                   format={'webp'} alternative={<AlbumDefault/>}/>
                            <div className={styles.count}>
                                {dragItems?.length}
                            </div>
                        </>
                    ) : ''}
                </div>
            ) : ''}
            <div className={`${styles.container} ${noPadding ? styles.noPadding : ''}`}>
                {playlist?.length ? (playlist[0]?.tracks?.length ? playlist[0].tracks.map((track, index) => (
                    <div key={index} id={track?._id} draggable={true}
                         onContextMenu={e => handleContextMenu(e, selectedTracks?.length && selectedTracks?.includes(track?._id) ? selectedTracks : [track])}
                         onDragStart={e => handleMouseDown(e, track)} onClick={e => handleSelectTrack(e, track?._id)} onMouseMove={() => dragStart(track)} onMouseUp={() => dragEnd(track)}
                         className={`${styles.track} ${!track?.audio ? styles.disabled : ''} ${selectedTracks?.includes(track?._id) && !dragItems?.find(t => t?._id === track?._id) ? styles.highlight : ''} ${dragItems?.find(t => t?._id === track?._id) ? styles.dragging : ''}`}>
                        <div className={styles.id}>
                            {contextTrack?._id === track?._id && isPlaying ? (
                                <span className={styles.playing}>
                                    <span></span>
                                    <span></span>
                                </span>
                            ) : (
                                <span>
                                    {index + 1}
                                </span>
                            )}
                        </div>
                        <div className={styles.cover}>
                            <Image src={track?.album?.cover || '0'} width={40} height={40} format={'webp'}
                                   alternative={<AlbumDefault/>}
                                   loading={<Skeleton style={{top: '-3px'}} width={40} height={40}/>}/>
                            <button className={styles.play} onClick={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (contextTrack?._id === track?._id && isPlaying) handlePlayPause(false) // If track is playing, pause track
                                else handlePlay(track?._id, user, playlist[0], setModal, queue, setQueue, queueIndex, setQueueIndex, handlePlayPause, null, 'playlist') // Otherwise, play track
                            }}>
                                {contextTrack?._id === track?._id && isPlaying ? (
                                    <PauseIcon/>
                                ) : (
                                    <PlayIcon rounded={true}/>
                                )}
                            </button>
                        </div>
                        <div className={styles.infoColumn}>
                            <div className={styles.title}>
                                <p className={styles.titleInner}>
                                    {track?.title}
                                </p>
                                {track?.explicit ? (
                                    <TooltipHandler title={'Explicit content'}>
                                        <ExplicitIcon fill={selectedTracks?.includes(track?._id) && !dragItems?.find(t => t?._id === track?._id) ? '#1c1c1c' : '#eee'}/>
                                    </TooltipHandler>
                                ) : ''}
                            </div>
                            <div className={styles.artist}>
                                <Link href={'/artist/[id]'} as={`/artist/${track?.album?.artist?._id}`}
                                      onClick={e => e.stopPropagation()}>
                                    {track?.album?.artist?.name}
                                </Link>
                            </div>
                        </div>
                        <div className={styles.album}>
                            <Link href={'/album/[id]'} as={`/album/${track?.album?._id}`}
                                  onClick={e => e.stopPropagation()}>
                                {track?.album?.title}
                            </Link>
                        </div>
                        <div className={styles.lastColumn}>
                            <button className={styles.like} onClick={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleLikeTrack(track?._id)
                            }}>
                                <LikeIcon
                                    fill={playlist[0]?.likes?.includes(track?._id) ? (selectedTracks?.includes(track?._id) && !dragItems?.find(t => t?._id === track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR) : 'none'}
                                    stroke={playlist[0]?.likes?.includes(track?._id) ? (selectedTracks?.includes(track?._id) && !dragItems?.find(t => t?._id === track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR) : selectedTracks?.includes(track?._id) ? '#1c1c1c' : '#eee'}/>
                            </button>
                            <div
                                className={styles.duration}>{track?.audio && track?.duration ? formatTime(track?.duration) : '--:--'}</div>
                            <button onClick={e => handleContextMenu(e, [track])}>
                                <OptionsIcon
                                    fill={selectedTracks?.includes(track?._id) && !dragItems?.find(t => t?._id === track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR}/>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className={styles.noTracks}>
                        There are no tracks in this playlist.
                    </div>
                )) : album?.length ? (
                    album[0]?.discs?.length ? album[0]?.discs?.map((disc, index) => (
                        <div key={index} className={styles.disc}>
                            {album[0]?.discs?.length > 1 ? (
                                <div className={styles.discTitle}>
                                    <DiscIcon stroke={'#eee'}/>
                                    <span>Disc {index + 1}</span>
                                </div>
                            ) : ''}
                            {disc?.length ? disc?.map((track, index) => (
                                <div key={index} id={track?._id}
                                     onContextMenu={e => handleContextMenu(e, selectedTracks?.length && selectedTracks?.includes(track?._id) ? selectedTracks : [track])}
                                     onClick={e => handleSelectTrack(e, track?._id)}
                                     className={`${styles.track} ${!track?.audio ? styles.disabled : ''} ${selectedTracks?.includes(track?._id) ? styles.highlight : ''}`}>
                                    <div className={styles.id}>
                                        {contextTrack?._id === track?._id && isPlaying ? (
                                            <>
                                                <span className={styles.playing}>
                                                    <span></span>
                                                    <span></span>
                                                </span>
                                                <button onClick={e => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handlePlayPause(false)
                                                }}>
                                                    <PauseIcon
                                                        fill={selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR}/>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span>
                                                    {index + 1}
                                                </span>
                                                <button onClick={e => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handlePlay(track?._id, user, album[0], setModal, queue, setQueue, queueIndex, setQueueIndex, handlePlayPause, null, 'album')
                                                }}>
                                                    <PlayIcon
                                                        fill={selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR}
                                                        rounded={true}/>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <div className={styles.title}>
                                        {track?.title}
                                        {track?.explicit ? (
                                            <TooltipHandler title={'Explicit content'}>
                                                <ExplicitIcon
                                                    fill={selectedTracks?.includes(track?._id) ? '#1c1c1c' : '#eee'}/>
                                            </TooltipHandler>
                                        ) : ''}
                                    </div>
                                    <div className={styles.lastColumn}>
                                        <button className={styles.like} onClick={e => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            toggleLikeTrack(track?._id)
                                        }}>
                                            <LikeIcon
                                                fill={album[0]?.likes?.includes(track?._id) ? (selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR) : 'none'}
                                                stroke={album[0]?.likes?.includes(track?._id) ? (selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR) : selectedTracks?.includes(track?._id) ? '#1c1c1c' : '#eee'}/>
                                        </button>
                                        <div
                                            className={styles.duration}>{track?.audio && track?.duration ? formatTime(track?.duration) : '--:--'}</div>
                                        <button onClick={e => handleContextMenu(e, [track])}>
                                            <OptionsIcon
                                                fill={selectedTracks?.includes(track?._id) ? '#1c1c1c' : track?.audio ? process.env.ACCENT_COLOR : '#eee'}/>
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className={styles.noTracks}>
                                    There are no tracks in this disc.
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className={styles.noTracks}>
                            There are no discs in this album.
                        </div>
                    )
                ) : items?.length ? items[0]?.map((track, index) => (
                    <div key={index} id={track?._id}
                         onContextMenu={e => handleContextMenu(e, selectedTracks?.length && selectedTracks?.includes(track?._id) ? selectedTracks : [track])}
                         onMouseDown={e => track?.audio ? handleSelectTrack(e, track?._id) : e.preventDefault()}
                         className={`${styles.track} ${!track?.audio ? styles.disabled : ''} ${selectedTracks?.includes(track?._id) ? styles.highlight : ''}`}>
                        <div className={styles.id}>
                            {contextTrack?._id === track?._id && isPlaying ? (
                                <span className={styles.playing}>
                                    <span></span>
                                    <span></span>
                                </span>
                            ) : (
                                <span>
                                    {index + 1}
                                </span>
                            )}
                        </div>
                        <div className={styles.cover}>
                            <Image src={track?.album?.cover || '0'} width={40} height={40} format={'webp'}
                                   alternative={<AlbumDefault/>}
                                   loading={<Skeleton style={{top: '-3px'}} width={40} height={40}/>}/>
                            <button className={styles.play} onClick={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (contextTrack?._id === track?._id && isPlaying) handlePlayPause(false) // If track is playing, pause track
                                else handlePlay(track?._id, user, null, setModal, queue, setQueue, queueIndex, setQueueIndex, handlePlayPause, items, 'track') // Otherwise, play track
                            }}>
                                {contextTrack?._id === track?._id && isPlaying ? (
                                    <PauseIcon/>
                                ) : (
                                    <PlayIcon rounded={true}/>
                                )}
                            </button>
                        </div>
                        <div className={styles.infoColumn}>
                            <div className={styles.title}>
                                <p className={styles.titleInner}>
                                    {track?.title}
                                </p>
                                {track?.explicit ? (
                                    <TooltipHandler title={'Explicit content'}>
                                        <ExplicitIcon fill={selectedTracks?.includes(track?._id) ? '#1c1c1c' : '#eee'}/>
                                    </TooltipHandler>
                                ) : ''}
                            </div>
                            <div className={styles.artist}>
                                <Link href={'/artist/[id]'} as={`/artist/${track?.album?.artist?._id}`}
                                      onClick={e => e.stopPropagation()}>
                                    {track?.album?.artist?.name}
                                </Link>
                            </div>
                        </div>
                        <div className={styles.album}>
                            <Link href={'/album/[id]'} as={`/album/${track?.album?._id}`}
                                  onClick={e => e.stopPropagation()}>
                                {track?.album?.title}
                            </Link>
                        </div>
                        <div className={styles.lastColumn}>
                            <button className={styles.like} onClick={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleLikeTrack(track?._id)
                            }}>
                                <LikeIcon
                                    fill={items[2]?.length && items[2].find(t => t._id === track?._id) ? (selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR) : 'none'}
                                    stroke={items[2]?.length && items[2].find(t => t._id === track?._id) ? (selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR) : selectedTracks?.includes(track?._id) ? '#1c1c1c' : '#eee'}/>
                            </button>
                            <div
                                className={styles.duration}>{track?.audio && track?.duration ? formatTime(track?.duration) : '--:--'}</div>
                            <button onClick={e => handleContextMenu(e, [track])}>
                                <OptionsIcon
                                    fill={selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR}/>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className={styles.noTracks}>
                        There are no tracks in this list.
                    </div>
                )}
            </div>
        </>
    )
}