import axios from 'axios'
import {useRouter} from 'next/router'
import Head from 'next/head'
import Link from '@/components/link'
import Image from '@/components/image'
import {useContext, useEffect, useState} from 'react'
import Skeleton from 'react-loading-skeleton'
import {AuthContext} from '@/contexts/auth'
import {QueueContext} from '@/contexts/queue'
import {LibraryContext} from '@/contexts/library'
import {ModalContext} from '@/contexts/modal'
import CustomScrollbar from '@/components/custom-scrollbar'
import {TooltipHandler} from '@/components/tooltip'
import AskLoginModal from '@/components/modals/ask-login'
import NotFoundPage from '@/pages/404'
import getAlbumData from '@/utils/get-album-data'
import formatTime from '@/utils/format-time'
import {AlbumDefault, OptionsIcon, PauseIcon, PlayIcon, ExplicitIcon, LikeIcon} from '@/icons'
import styles from '@/styles/album.module.sass'

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

export default function AlbumPage({id}) {
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
    const [album, setAlbum] = useState(null) // Album data
    const [selectedTracks, setSelectedTracks] = useState([]) // Selected tracks

    const getAlbumInfo = async () => {
        if (!id) return // If ID property is not defined, return
        const albumData = await getAlbumData(id, user?.id) // Get album data from API
        if (albumData?._id || albumData?.id) setAlbum(albumData)
        setLoad(true) // Set load state to true
    }

    useEffect(() => {
        if (!user?.loaded) return // If user is not loaded, return
        if (!id) return // If query ID is not defined, return
        getAlbumInfo() // Otherwise, get album info from API

        return () => { // When component is unmounted
            setAlbum(null) // Reset album data
            setLoad(false) // Reset load state
            setSelectedTracks([]) // Reset selected tracks
        }
    }, [id, user])


    const handlePlay = (id = null) => {
        if (!user || !user?.id || !user?.token) return setModal({ // If track ID is not defined or user is not logged in, open ask login modal
            active: <AskLoginModal/>,
            canClose: true,
        })
        if (id && !album?.tracks?.find(t => t._id === id)?.audio) return // If track ID is defined and track audio is not exists, return

        if (id && queue?.length && queue?.findIndex(t => t.id === id) === queueIndex) { // If track ID is defined and track is already in the queue
            handlePlayPause(true) // Play track
            return
        }

        const filteredTracks = album?.tracks?.filter(t => !!t.audio) // Filter tracks that have audio
        const index = id ? filteredTracks?.findIndex(t => t._id === id) : 0

        setQueue(filteredTracks?.map(t => ({id: t._id, audio: t.audio})) || []) // Set queue to the album tracks
        setQueueIndex(index) // Set queue index to the track index
        handlePlayPause(true)
    }

    const toggleLikeAlbum = async () => {
        if (!album?._id) return // If album ID is not defined, return
        if (!user?.id || !user?.token) return setModal({ // If album ID is not defined or user is not logged in, open ask login modal
            active: <AskLoginModal/>,
            canClose: true,
        })

        const response = await axios.post(`${process.env.API_URL}/album/like/${album._id}`, { // Send POST request to the API
            like: album?.liked ? -1 : 1,
        }, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            }
        })

        if (response.data?.status === 'OK') { // If there is a response
            if (response.data?.liked) setAlbum({...album, liked: true}) // If album is liked, set liked state to true
            else setAlbum({...album, liked: false}) // Otherwise, set liked state to false
            getUserLibrary() // Get user library
        }
    }

    const toggleLikeTrack = async (trackId) => {
        if (!trackId || !album?.tracks?.find(t => t._id === trackId)?.audio) return // If track ID is not defined or track audio is not exists, return
        if (!user?.id || !user?.token) return setModal({ // If track ID is not defined or user is not logged in, open ask login modal
            active: <AskLoginModal/>,
            canClose: true,
        })

        const liked = album?.likes?.includes(trackId) // Check if track is liked
        const response = await axios.post(`${process.env.API_URL}/track/like/${trackId}`, { // Send POST request to the API
            like: liked ? -1 : 1,
        }, {
            headers: {
                Authorization: `Bearer ${user.token}`,
            }
        })

        if (response.data?.status === 'OK') { // If there is a response
            const updatedAlbum = {...album} // Create updated album data
            if (response.data?.liked && !updatedAlbum.likes.includes(trackId)) updatedAlbum.likes.push(trackId) // If track is liked, push track ID to the likes array
            else updatedAlbum.likes = updatedAlbum.likes.filter(t => t !== trackId) // Otherwise, remove track ID from the likes array
            setAlbum(updatedAlbum) // Set album data to the updated album data

            if (contextTrack && contextTrack._id === trackId) setIsLiked(response.data?.liked) // If track is defined and track ID is equal to the liked track ID, set isLiked state to the response data
        }
    }

    useEffect(() => {
        if (!contextTrack) return

        if (album?.tracks?.find(t => t._id === contextTrack?._id)) {
            if (isLiked && !album?.likes?.includes(contextTrack?._id)) setAlbum({...album, likes: [...album.likes, contextTrack?._id]}) // If track is not liked, push track ID to the likes array
            else if (!isLiked && album?.likes?.includes(contextTrack?._id)) setAlbum({...album, likes: album.likes.filter(t => t !== contextTrack?._id)}) // Otherwise, remove track ID from the likes array
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
            const tracks = album?.tracks?.filter(t => t?.audio)?.map(t => t?._id)
            const firstIndex = tracks?.indexOf(selectedTracks[0])
            const lastIndex = tracks?.indexOf(id)
            const selected = tracks?.slice(Math.min(firstIndex, lastIndex), Math.max(firstIndex, lastIndex) + 1)
            setSelectedTracks(selected)
        } else setSelectedTracks([id])
    }

    return load && !album?._id && !album?.id ? <NotFoundPage/> : (
        <>
            <Head>
                <title>{album?.title ? `${album.title} by ${album?.artist?.name} — ` : ''}Rival Music</title>
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
                            {album?.cover ?
                                <image href={`${process.env.IMAGE_CDN}/${album?.cover}?width=100&height=100&format=webp`} width="110%"
                                       height="110%" x="-20" y="-20" preserveAspectRatio="none"
                                       filter="url(#displacementFilter)"/> : ''}
                        </svg>
                    </div>
                    <div className={styles.content}>
                        <div className={styles.coverSection}>
                            <div className={styles.coverWrapper}>
                                <div className={styles.cover}>
                                    <Image src={album?.cover} width={600} height={600} format={'webp'} alternative={<AlbumDefault/>} loading={<Skeleton style={{top: '-3px'}} height={300}/>}/>
                                </div>
                                <div className={styles.albumInfo}>
                                    <div className={styles.info}>
                                        <h2 className={styles.title}>
                                            {!load || !album?.title ?
                                                <Skeleton width={250} height={40}/> :
                                                album?.title}
                                        </h2>
                                        {!load || !album?.artist?.name ? (
                                            <Skeleton width={100} height={20}/>
                                        ) : (
                                            <Link href={'/artist/[id]'}
                                                  as={`/artist/${album?.artist?._id || album?.artist?.id}`}
                                                  className={styles.artist}>{album?.artist?.name}</Link>
                                        )}
                                        {!load || !album?.releaseYear || !album?.genres?.length ? (
                                            <Skeleton width={150} height={20}/>
                                        ) : (
                                            <div className={styles.small}>
                                                <span className={styles.genre}>{album?.genres?.length ? (
                                                    album.genres[0].split(' ').map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(' ')
                                                ) : ''}</span>
                                                <span className={styles.releaseYear}>{album?.releaseYear}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.buttons}>
                                        <button
                                            className={`${styles.play} ${!album?.tracks?.length || !album?.tracks?.filter(t => !!t.audio).length ? styles.disabled : ''}`}
                                            onClick={() => handlePlay()}>
                                            <PlayIcon fill={'#1c1c1c'} rounded={true}/> Play
                                        </button>
                                        {album !== null && (
                                            <button className={styles.like} onClick={() => toggleLikeAlbum()}>
                                                <LikeIcon fill={album?.liked ? '#1c1c1c' : 'none'} stroke={'#1c1c1c'} strokeRate={1.25}/>
                                                {album?.liked ? 'Liked' : 'Like'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {user?.id && user?.token && user?.admin ? (
                                    <div className={styles.adminControls}>
                                        <Link href={`/admin/track/create#${album?._id || album?.id}`}>Add Track</Link>
                                        <Link href={'/admin/album/[id]'} as={`/admin/album/${album?._id || album?.id}`}>Edit Album</Link>
                                    </div>
                                ) : ''}
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
                                ) : album && album?.tracks?.length ? album?.tracks?.map((track, index) => (
                                    <div key={index} id={track?._id}
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
                                                        <PauseIcon fill={selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR}/>
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
                                                        handlePlay(track?._id)
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
                                                    <span className={styles.explicit}>
                                                        <ExplicitIcon fill={selectedTracks?.includes(track?._id) ? '#1c1c1c' : '#eee'}/>
                                                    </span>
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
                                                    fill={album?.likes?.includes(track?._id) ? (selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR) : 'none'}
                                                    stroke={album?.likes?.includes(track?._id) ? (selectedTracks?.includes(track?._id) ? '#1c1c1c' : process.env.ACCENT_COLOR) : selectedTracks?.includes(track?._id) ? '#1c1c1c' : '#eee'}/>
                                            </button>
                                            <div
                                                className={styles.duration}>{track?.audio && track?.duration ? formatTime(track?.duration) : '--:--'}</div>
                                            <button>
                                                <OptionsIcon
                                                    fill={selectedTracks?.includes(track?._id) ? '#1c1c1c' : track?.audio ? process.env.ACCENT_COLOR : '#eee'}/>
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className={styles.noTracks}>
                                        There are no tracks in this album.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}