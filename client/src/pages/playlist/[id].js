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
import {DialogueContext} from '@/contexts/dialogue'
import {ContextMenuContext} from '@/contexts/context-menu'
import CustomScrollbar from '@/components/custom-scrollbar'
import {TooltipHandler} from '@/components/tooltip'
import Input from '@/components/form/input'
import PlaylistImage from '@/components/playlist-image'
import PlaylistContextMenu from '@/components/context-menus/playlist'
import AskLoginModal from '@/components/modals/ask-login'
import EditPlaylistModal from '@/components/modals/edit-playlist'
import Tracks, {handlePlay} from '@/components/tracks'
import NotFoundPage from '@/pages/404'
import getPlaylistData from '@/utils/get-playlist-data'
import {AlbumDefault, PlayIcon, ExplicitIcon, LikeIcon, EditIcon, AddIcon} from '@/icons'
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
        handlePlayPause,
        track: contextTrack,
        isLiked,
    } = useContext(QueueContext) // Get queue data from QueueContext
    const [, , getUserLibrary] = useContext(LibraryContext) // Get user library
    const [, setModal] = useContext(ModalContext) // Get setModal function from ModalContext
    const [, setDialogue] = useContext(DialogueContext) // Get setDialogue function from DialogueContext
    const [, setContextMenu] = useContext(ContextMenuContext) // Get setContextMenu function from ContextMenuContext
    const [playlist, setPlaylist] = useState(null) // Playlist data
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
        }
    }, [id, user])

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

    useEffect(() => {
        if (!contextTrack) return

        if (playlist?.tracks?.find(t => t._id === contextTrack?._id)) {
            if (isLiked && !playlist?.likes?.includes(contextTrack?._id)) setPlaylist({...playlist, likes: [...(playlist?.likes || []), contextTrack?._id]}) // If track is not liked, push track ID to the likes array
            else if (!isLiked && playlist?.likes?.includes(contextTrack?._id)) setPlaylist({...playlist, likes: (playlist?.likes || [])?.filter(t => t !== contextTrack?._id)}) // Otherwise, remove track ID from the likes array
        }
    }, [isLiked, contextTrack])

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

    const handleContextMenu = e => {
        e.preventDefault()
        e.stopPropagation()
        setContextMenu({
            menu: <PlaylistContextMenu playlist={playlist}/>,
            x: e.clientX,
            y: e.clientY,
        })
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
                            <div className={styles.coverWrapper} onContextMenu={handleContextMenu}>
                                <div className={styles.cover}>
                                    <PlaylistImage playlist={playlist}/>
                                    {playlist?.owner?._id === user?.id || user?.admin ? (
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
                                                        `${playlist?.likedUsers || 0} likes`
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
                                            onClick={() => handlePlay(null, user, playlist, setModal, queue, setQueue, queueIndex, setQueueIndex, handlePlayPause)}>
                                            <PlayIcon fill={'#1c1c1c'} rounded={true}/> Play
                                        </button>
                                        {playlist !== null && playlist?.owner?._id !== user?.id ? (
                                            <button className={styles.like} onClick={handleLikePlaylist}>
                                                <LikeIcon fill={playlist?.liked ? '#1c1c1c' : 'none'} stroke={'#1c1c1c'} strokeRate={1.25}/>
                                                {playlist?.liked ? 'Liked' : 'Like'}
                                            </button>
                                        ) : ''}
                                    </div>
                                    {user?.loaded && playlist?.owner?._id === user?.id || user?.admin ? (
                                        <button className={styles.delete} onClick={handleConfirmDelete}>
                                            Delete
                                        </button>
                                    ) : ''}
                                </div>
                            </div>
                        </div>
                        <div className={styles.tracksSection}>
                            {!load ? (
                                <>
                                    <Skeleton width={'100%'} height={52} borderRadius={8}/>
                                    <Skeleton width={'100%'} height={52} borderRadius={8}/>
                                    <Skeleton width={'100%'} height={52} borderRadius={8}/>
                                </>
                            ) : <Tracks playlist={[playlist, setPlaylist]}/>}
                        </div>
                        {user?.loaded && playlist?.owner?._id === user?.id || user?.admin ? (
                            <div className={styles.addTrackForm}>
                                <h3 className={styles.formTitle}>Add track to playlist</h3>
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
                                                <AddIcon stroke={process.env.ACCENT_COLOR} strokeRate={1.5}/>
                                            </button>
                                        </div>
                                    )) : ''}
                                </div>
                            </div>
                        ) : ''}
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}