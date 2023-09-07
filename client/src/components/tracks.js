import axios from 'axios'
import {useRouter} from 'next/router'
import {useContext, useEffect, useState} from 'react'
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
import {AlbumDefault, ExplicitIcon, LikeIcon, OptionsIcon, PauseIcon, PlayIcon} from '@/icons'
import styles from '@/styles/tracks.module.sass'

export const handlePlay = (id = null, user, playlist, setModal, queue, setQueue, queueIndex, setQueueIndex, handlePlayPause) => {
    if (!user || !user?.id || !user?.token) return setModal({ // If track ID is not defined or user is not logged in, open ask login modal
        active: <AskLoginModal/>,
        canClose: true,
    })
    if (id && !playlist?.tracks?.find(t => t._id === id)?.audio) return // If track ID is defined and track audio is not exists, return

    if (id && queue?.length && queue?.findIndex(t => t.id === id) === queueIndex) { // If track ID is defined and track is already in the queue
        handlePlayPause(true) // Play track
        return
    }

    const filteredTracks = playlist?.tracks?.filter(t => !!t.audio) // Filter tracks that have audio
    const index = id ? filteredTracks?.findIndex(t => t._id === id) : 0

    setQueue(filteredTracks?.map(t => ({id: t._id, audio: t.audio})) || []) // Set queue to the playlist tracks
    setQueueIndex(index) // Set queue index to the track index
    handlePlayPause(true) // Play track
}

export default function Tracks({playlist: [playlist, setPlaylist]}) {
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
    const [selectedTracks, setSelectedTracks] = useState([]) // Selected tracks

    useEffect(() => {
        return () => {
            setSelectedTracks([]) // Reset selected tracks
        }
    }, [])

    useEffect(() => {
        const hash = router?.asPath?.split('#')[1] // Get hash from URL
        if (hash) setSelectedTracks([hash]) // If hash is defined, set selected tracks to the hash
    }, [router.asPath])

    const handleSelectTrack = (e, id) => {
        if (e.button !== 0) return // If mouse button is not left, return
        if (e.ctrlKey || e.metaKey) {
            if (selectedTracks.includes(id)) setSelectedTracks(selectedTracks.filter(t => t !== id))
            else setSelectedTracks([...selectedTracks, id])
        } else if (e.shiftKey) {
            const tracks = playlist?.tracks?.filter(t => t?.audio)?.map(t => t?._id)
            const firstIndex = tracks?.indexOf(selectedTracks[0])
            const lastIndex = tracks?.indexOf(id)
            const selected = tracks?.slice(Math.min(firstIndex, lastIndex), Math.max(firstIndex, lastIndex) + 1)
            setSelectedTracks(selected)
        } else if (selectedTracks?.includes(id)) setSelectedTracks([])
        else setSelectedTracks([id])
    }

    const handleTrackContextMenu = (e, _tracks) => {
        e.preventDefault()
        e.stopPropagation()

        const tracks = []
        if (typeof _tracks[0] === 'string') {
            _tracks.map(t => {
                const foundTrack = playlist.tracks.find(tr => tr._id === t)
                if (foundTrack) tracks.push(foundTrack)
            })
        } else tracks.push(_tracks[0])

        setContextMenu({
            menu: <TrackContextMenu tracks={tracks} playlist={[playlist, setPlaylist]} toggleLikeTrack={toggleLikeTrack}/>,
            x: e.clientX,
            y: e.clientY,
        })
    }

    const toggleLikeTrack = async (trackId) => {
        if (!user?.id || !user?.token) return setModal({ // If track ID is not defined or user is not logged in, open ask login modal
            active: <AskLoginModal/>,
            canClose: true,
        })

        const liked = playlist?.likes?.includes(trackId) // Check if track is liked
        const response = await axios.post(`${process.env.API_URL}/track/like/${trackId}`, { // Send POST request to the API
            like: liked ? -1 : 1,
        }, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            }
        })

        if (response.data?.status === 'OK') { // If there is a response
            const updatedPlaylist = {...playlist} // Create updated playlist data
            if (response.data?.liked && !updatedPlaylist?.likes?.includes(trackId)) updatedPlaylist?.likes?.push(trackId) // If track is liked, push track ID to the likes array
            else if (updatedPlaylist?.likes) updatedPlaylist.likes = updatedPlaylist?.likes?.filter(t => t !== trackId) // Otherwise, remove track ID from the likes array
            setPlaylist(updatedPlaylist) // Set playlist data to the updated playlist data

            if (contextTrack && contextTrack._id === trackId) setIsLiked(response.data?.liked) // If track is defined and track ID is equal to the liked track ID, set isLiked state to the response data
        }
    }

    return (
        <div className={styles.container}>
            {playlist?.tracks?.length ? playlist.tracks.map((track, index) => (
                <div key={index} id={track?._id}
                     onContextMenu={e => handleTrackContextMenu(e, selectedTracks?.length && selectedTracks?.includes(track?._id) ? selectedTracks : [track])}
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
                            else handlePlay(track?._id, user, playlist, setModal, queue, setQueue, queueIndex, setQueueIndex, handlePlayPause) // Otherwise, play track
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
                                fill={playlist?.likes?.includes(track?._id) ? (selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR) : 'none'}
                                stroke={playlist?.likes?.includes(track?._id) ? (selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR) : selectedTracks?.includes(track?._id) ? '#1c1c1c' : '#eee'}/>
                        </button>
                        <div
                            className={styles.duration}>{track?.audio && track?.duration ? formatTime(track?.duration) : '--:--'}</div>
                        <button onClick={e => handleTrackContextMenu(e, [track])}>
                            <OptionsIcon
                                fill={selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR}/>
                        </button>
                    </div>
                </div>
            )) : (
                <div className={styles.noTracks}>
                    There are no tracks in this playlist.
                </div>
            )}
        </div>
    )
}