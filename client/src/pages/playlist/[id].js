import axios from 'axios'
import {useRouter} from 'next/router'
import Head from 'next/head'
import Link from '@/components/link'
import Image from '@/components/image'
import {useContext, useEffect, useRef, useState} from 'react'
import Skeleton from 'react-loading-skeleton'
import {AuthContext} from '@/contexts/auth'
import {QueueContext} from '@/contexts/queue'
import {LibraryContext} from '@/contexts/library'
import {ModalContext} from '@/contexts/modal'
import CustomScrollbar from '@/components/custom-scrollbar'
import {TooltipHandler} from '@/components/tooltip'
import Input from '@/components/form/input'
import PlaylistImage from '@/components/playlist-image'
import AskLoginModal from '@/components/modals/ask-login'
import EditPlaylistModal from '@/components/modals/edit-playlist'
import NotFoundPage from '@/pages/404'
import getPlaylistData from '@/utils/get-playlist-data'
import formatTime from '@/utils/format-time'
import {AlbumDefault, OptionsIcon, PauseIcon, PlayIcon, ExplicitIcon, LikeIcon, EditIcon, AddIcon} from '@/icons'
import styles from '@/styles/playlist.module.sass'

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

export default function PlaylistPage({id}) {
    const router = useRouter() // Router instance
    const [load, setLoad] = useState(false) // Is profile loaded
    const [user] = useContext(AuthContext) // Get user data from AuthContext
    const {
        queue,
        setQueue,
        queueIndex,
        setQueueIndex,
        isPlaying,
        handlePlayPause,
        track: contextTrack,
        isLiked,
        setIsLiked,
    } = useContext(QueueContext) // Get queue data from QueueContext
    const [, , getUserLibrary] = useContext(LibraryContext) // Get user library
    const [, setModal] = useContext(ModalContext) // Get setModal function from ModalContext
    const [playlist, setPlaylist] = useState(null) // Playlist data
    const [selectedTracks, setSelectedTracks] = useState([]) // Selected tracks
    const [searchResults, setSearchResults] = useState([]) // Search results
    const searchRef = useRef('') // Search ref
    const searchTimeoutRef = useRef()

    const getPlaylistInfo = async () => {
        if (!id) return // If ID property is not defined, return
        const playlistData = await getPlaylistData(id, user?.id) // Get playlist data from API
        if (playlistData?._id || playlistData?.id) setPlaylist(playlistData)
        setLoad(true) // Set load state to true
    }

    useEffect(() => {
        if (!user?.loaded) return // If user is not loaded, return
        if (!id) return // If query ID is not defined, return
        getPlaylistInfo() // Otherwise, get playlist info from API

        return () => { // When component is unmounted
            setPlaylist(null) // Reset playlist data
            setLoad(false) // Reset load state
            setSelectedTracks([]) // Reset selected tracks
        }
    }, [id, user])


    const handlePlay = (id = null) => {
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
        handlePlayPause(true)
    }

    const handleLikePlaylist = async () => {
        if (!playlist?._id) return // If playlist ID is not defined, return
        if (!user?.id || !user?.token) return setModal({ // If user is not logged in, open ask login modal
            active: <AskLoginModal/>,
            canClose: true,
        })


        try {
            const response = await axios.post(`${process.env.API_URL}/playlist/like/${playlist._id}`, { // Send POST request to the API
                like: playlist?.liked ? -1 : 1,
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            })

            if (response.data?.status === 'OK') { // If there is a response
                setPlaylist({...playlist, liked: response.data?.liked || false, likedUsers: response.data?.likes || 0})
                getUserLibrary() // Get user library
            }
        } catch (e) {
            console.error(e)
        }
    }

    const toggleLikeTrack = async (trackId) => {
        if (!trackId || !playlist?.tracks?.find(t => t._id === trackId)?.audio) return // If track ID is not defined or track audio is not exists, return
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

    useEffect(() => {
        if (!contextTrack) return

        if (playlist?.tracks?.find(t => t._id === contextTrack?._id)) {
            if (isLiked && !playlist?.likes?.includes(contextTrack?._id)) setPlaylist({...playlist, likes: [...(playlist?.likes || []), contextTrack?._id]}) // If track is not liked, push track ID to the likes array
            else if (!isLiked && playlist?.likes?.includes(contextTrack?._id)) setPlaylist({...playlist, likes: (playlist?.likes || [])?.filter(t => t !== contextTrack?._id)}) // Otherwise, remove track ID from the likes array
        }
    }, [isLiked, contextTrack])

    useEffect(() => {
        const hash = router?.asPath?.split('#')[1]
        if (hash) setSelectedTracks([hash])
    }, [router.asPath])

    const handleSelectTrack = (e, id) => {
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

    const handleSearch = async () => {
        if (!searchRef.current?.trim()?.length) return setSearchResults([]) // If search query is empty, return
        if (!user?.id || !user?.token) return setModal({ // If user is not logged in, open ask login modal
            active: <AskLoginModal/>,
            canClose: true,
        })

        try {
            const response = await axios.get(`${process.env.API_URL}/track?query=${searchRef.current?.trim()}&limit=10`, { // Send GET request to the API
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            })

            if (response.data?.status === 'OK' && response.data?.tracks) { // If there is a response
                setSearchResults(response.data?.tracks)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleAddTrack = async track => {
        if (!user?.id || !user?.token) return setModal({ // If user is not logged in, open ask login modal
            active: <AskLoginModal/>,
            canClose: true,
        })

        try {
            const response = await axios.post(`${process.env.API_URL}/playlist/add-tracks/${playlist?._id}`, { // Send POST request to the API
                tracks: [track?._id],
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            })

            if (response.data?.status === 'OK') { // If there is a response
                setPlaylist({...playlist, tracks: [...(playlist?.tracks || []), ...response.data?.tracks]})
                setSearchResults([])
                searchRef.current = ''
            }
        } catch (e) {
            console.error(e)
        }
    }

    return load && !playlist?._id && !playlist?.id ? <NotFoundPage/> : (
        <>
            <Head>
                <title>{playlist?.title ? `${playlist.title} by ${playlist?.owner?.name} — ` : ''}Rival Music</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.coverBackground}>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="100%">
                            <filter id="displacementFilter">
                                <feTurbulence type="turbulence" baseFrequency=".01 .01"
                                              numOctaves="8" result="turbulence" seed="10"/>
                                <feDisplacementMap in2="turbulence" in="SourceGraphic"
                                                   scale="60" xChannelSelector="R" yChannelSelector="B"/>
                            </filter>
                            {playlist?.image ? (
                                <image href={`${process.env.IMAGE_CDN}/${playlist?.image}?width=100&height=100&format=webp`} width="385"
                                       height="385" x="-20" y="-20" preserveAspectRatio="none" filter="url(#displacementFilter)"/>
                            ) : playlist?.covers?.length && playlist?.covers?.length > 3 ? (
                                <>
                                    <image href={`${process.env.IMAGE_CDN}/${playlist?.covers[0]}?width=25&height=25&format=webp`} width="193"
                                         height="193" x="-20" y="-20" preserveAspectRatio="none" filter="url(#displacementFilter)"/>
                                    <image href={`${process.env.IMAGE_CDN}/${playlist?.covers[1]}?width=25&height=25&format=webp`} width="193"
                                         height="193" x="173" y="-20" preserveAspectRatio="none" filter="url(#displacementFilter)"/>
                                    <image href={`${process.env.IMAGE_CDN}/${playlist?.covers[2]}?width=25&height=25&format=webp`} width="193"
                                         height="193" x="-20" y="173" preserveAspectRatio="none" filter="url(#displacementFilter)"/>
                                    <image href={`${process.env.IMAGE_CDN}/${playlist?.covers[3]}?width=25&height=25&format=webp`} width="193"
                                         height="193" x="173" y="173" preserveAspectRatio="none" filter="url(#displacementFilter)"/>
                                </>
                            ) : playlist?.covers?.length ? (
                                <image href={`${process.env.IMAGE_CDN}/${playlist?.covers[0]}?width=100&height=100&format=webp`} width="385"
                                       height="385" x="-20" y="-20" preserveAspectRatio="none" filter="url(#displacementFilter)"/>
                            ) : (
                                <rect width="385" height="385" x="-20" y="-20" fill={'#161616'}/>
                            )}
                        </svg>
                    </div>
                    <div className={styles.content}>
                        <div className={styles.coverSection}>
                            <div className={styles.coverWrapper}>
                                <div className={styles.cover}>
                                    <PlaylistImage playlist={playlist}/>
                                    {playlist?.owner?._id === user?.id ? (
                                        <div className={styles.overlay} onClick={() => {
                                            setModal({
                                                active: <EditPlaylistModal id={playlist?._id} setPlaylist={setPlaylist}/>,
                                                canClose: true,
                                            })
                                        }}>
                                            <EditIcon stroke={'#eee'}/>
                                            Edit Playlist
                                        </div>
                                    ) : ''}
                                </div>
                                <div className={styles.playlistInfo}>
                                    <div className={styles.info}>
                                        <h2 className={styles.title}>
                                            {!load || !playlist?.title ?
                                                <Skeleton width={250} height={40}/> :
                                                playlist?.title}
                                        </h2>
                                        {!load || !playlist?.owner?.name ? (
                                            <Skeleton width={100} height={20}/>
                                        ) : (
                                            <Link href={'/profile/[id]'}
                                                  as={`/profile/${playlist?.owner?._id || playlist?.owner?.id}`}
                                                  className={styles.owner}>{playlist?.owner?.name}</Link>
                                        )}
                                        {!load || !playlist?.createdAt ? (
                                            <Skeleton width={150} height={20}/>
                                        ) : (
                                            <div className={styles.small}>
                                                <span className={styles.likeCount}>{
                                                    playlist?.likedUsers === 1 ?
                                                        '1 like' :
                                                        `${playlist?.likedUsers} likes`
                                                }</span>
                                                <span className={styles.trackCount}>{
                                                    playlist?.tracks?.length === 1 ?
                                                        '1 track' :
                                                        `${playlist?.tracks?.length} tracks`
                                                }</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.buttons}>
                                        <button
                                            className={`${styles.play} ${!playlist?.tracks?.length || !playlist?.tracks?.filter(t => !!t.audio).length ? styles.disabled : ''}`}
                                            onClick={() => handlePlay()}>
                                            <PlayIcon fill={'#1c1c1c'} rounded={true}/> Play
                                        </button>
                                        {playlist !== null && playlist?.owner?._id !== user?.id ? (
                                            <button className={styles.like} onClick={handleLikePlaylist}>
                                                <LikeIcon fill={playlist?.liked ? '#1c1c1c' : 'none'} stroke={'#1c1c1c'} strokeRate={1.25}/>
                                                {playlist?.liked ? 'Liked' : 'Like'}
                                            </button>
                                        ) : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.tracksSection}>
                            <div className={styles.tracks}>
                                {!load ? (
                                    <>
                                        <Skeleton width={'100%'} height={52} borderRadius={8}/>
                                        <Skeleton width={'100%'} height={52} borderRadius={8}/>
                                        <Skeleton width={'100%'} height={52} borderRadius={8}/>
                                    </>
                                ) : playlist && playlist?.tracks?.length ? playlist?.tracks?.map((track, index) => (
                                    <div key={index} id={track?._id}
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
                                            <Image src={track?.album?.cover || '0'} width={40} height={40} format={'webp'} alternative={<AlbumDefault/>} loading={<Skeleton style={{top: '-3px'}} width={40} height={40}/>}/>
                                            <button className={styles.play} onClick={e => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                if (contextTrack?._id === track?._id && isPlaying) handlePlayPause(false) // If track is playing, pause track
                                                else handlePlay(track?._id) // Otherwise, play track
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
                                                <Link href={'/artist/[id]'} as={`/artist/${track?.album?.artist?._id}`} onClick={e => e.stopPropagation()}>
                                                    {track?.album?.artist?.name}
                                                </Link>
                                            </div>
                                        </div>
                                        <div className={styles.album}>
                                            <Link href={'/album/[id]'} as={`/album/${track?.album?._id}`} onClick={e => e.stopPropagation()}>
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
                                            <button>
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
                        </div>
                        <div className={styles.addTrackForm}>
                            <h3 className={styles.formTitle}>Add Track</h3>
                            <Input placeholder={'Search for a track to add'} className={styles.formField} set={searchRef} onChange={() => {
                                clearTimeout(searchTimeoutRef.current)
                                searchTimeoutRef.current = setTimeout(() => handleSearch(), 500)
                            }}/>
                            <div className={styles.results}>
                                {searchResults?.length ? searchResults?.map((track, index) => (
                                    <div key={index} className={styles.result}>
                                        <div className={styles.cover}>
                                            <Image src={track?.album?.cover || '0'} width={40} height={40} format={'webp'} alternative={<AlbumDefault/>} loading={<Skeleton style={{top: '-3px'}} width={40} height={40}/>}/>
                                        </div>
                                        <div className={styles.info}>
                                            <div className={styles.title}>
                                                <Link href={'/album/[id]'} as={`/album/${track?.album?._id}#${track._id}`} className={styles.titleInner}>
                                                    {track?.title}
                                                </Link>
                                                {track?.explicit ? (
                                                    <TooltipHandler title={'Explicit content'}>
                                                        <ExplicitIcon fill={'#eee'}/>
                                                    </TooltipHandler>
                                                ) : ''}
                                            </div>
                                            <div className={styles.artist}>
                                                <Link href={'/artist/[id]'} as={`/artist/${track?.album?.artist?._id}`}>
                                                    {track?.album?.artist?.name}
                                                </Link>
                                            </div>
                                        </div>
                                        <div className={styles.album}>
                                            <Link href={'/album/[id]'} as={`/album/${track?.album?._id}`}>
                                                {track?.album?.title}
                                            </Link>
                                        </div>
                                        <button className={styles.add} onClick={() => handleAddTrack(track)}>
                                            <AddIcon stroke={'#282828'} strokeRate={1.5}/>
                                        </button>
                                    </div>
                                )) : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}