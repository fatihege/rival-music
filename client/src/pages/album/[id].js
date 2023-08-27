import axios from 'axios'
import {useRouter} from 'next/router'
import Head from 'next/head'
import Link from '@/components/link'
import {useContext, useEffect, useState} from 'react'
import Skeleton from 'react-loading-skeleton'
import {AuthContext} from '@/contexts/auth'
import {QueueContext} from '@/contexts/queue'
import CustomScrollbar from '@/components/custom-scrollbar'
import {TooltipHandler} from '@/components/tooltip'
import NotFoundPage from '@/pages/404'
import getAlbumData from '@/utils/get-album-data'
import formatTime from '@/utils/format-time'
import {AlbumDefault, OptionsIcon, PauseIcon, PlayIcon, ExplicitIcon} from '@/icons'
import styles from '@/styles/album.module.sass'
import 'react-loading-skeleton/dist/skeleton.css'

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

const SkeletonBase = (props) => <Skeleton {...props} baseColor={'rgb(33,33,33)'} highlightColor={'rgb(45,45,45)'}/>

export default function AlbumPage({id}) {
    const router = useRouter() // Router instance
    const [load, setLoad] = useState(false) // Is profile loaded
    const [user] = useContext(AuthContext) // Get user data from AuthContext
    const {queue, setQueue, queueIndex, setQueueIndex, isPlaying, handlePlayPause, track: contextTrack, setTrack} = useContext(QueueContext) // Get queue data from QueueContext
    const [album, setAlbum] = useState(null) // Album data
    const [selectedTrack, setSelectedTrack] = useState(null) // Selected track ID

    const getAlbumInfo = async () => {
        if (!id) return // If ID property is not defined, return
        const albumData = await getAlbumData(id) // Get album data from API
        if (albumData?._id || albumData?.id) setAlbum(albumData)
        setLoad(true) // Set load state to true
    }

    useEffect(() => {
        if (!id) return // If query ID is not defined, return
        getAlbumInfo() // Otherwise, get album info from API

        return () => { // When component is unmounted
            setAlbum(null) // Reset album data
            setLoad(false) // Reset load state
        }
    }, [id])


    const handlePlay = (id = null) => {
        if (id && !album?.tracks?.find(t => t._id === id)?.audio) return // If track ID is defined and track audio is not exists, return

        if (id && queue?.length && queue?.findIndex(t => t.id === id) === queueIndex) { // If track ID is defined and track is already in the queue
            handlePlayPause(true) // Play track
            return
        }

        const filteredTracks = album?.tracks?.filter(t => !!t.audio) // Filter tracks that have audio
        const index = id ? filteredTracks?.findIndex(t => t._id === id) : 0
        const track = filteredTracks[index]

        setQueue(filteredTracks?.map(t => ({id: t._id, audio: t.audio})) || []) // Set queue to the album tracks
        setQueueIndex(index) // Set queue index to the track index
        handlePlayPause(true)


        if (track?._id) {
            axios.get(`${process.env.API_URL}/track/info/${track._id}`).then(res => {
                if (res.data?.track) setTrack(res.data.track) // Set track data to the queue
            })
        }
    }

    useEffect(() => {
        const hash = router?.asPath?.split('#')[1]
        if (hash) setSelectedTrack(hash)
    }, [router])

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
                                <image href={`${process.env.IMAGE_CDN}/${album?.cover}`} width="110%"
                                       height="110%" x="-20" y="-20" preserveAspectRatio="none"
                                       filter="url(#displacementFilter)"/> : ''}
                        </svg>
                    </div>
                    <div className={styles.content}>
                        <div className={styles.coverSection}>
                            <div className={styles.coverWrapper}>
                                <div className={styles.cover}>
                                    {!load ? <SkeletonBase style={{top: '-3px'}} height={300}/> :
                                        album?.cover ? <img src={`${process.env.IMAGE_CDN}/${album.cover}`} alt={`${album?.title} Cover`}/> :
                                        <AlbumDefault/>}
                                </div>
                                <div className={styles.albumInfo}>
                                    <div className={styles.info}>
                                        <h2 className={styles.title}>
                                            {!load || !album?.title ?
                                                <SkeletonBase width={250} height={40}/> :
                                                album?.title}
                                        </h2>
                                        {!load || !album?.artist?.name ? (
                                            <SkeletonBase width={100} height={20}/>
                                        ) : (
                                            <Link href={'/artist/[id]'}
                                                  as={`/artist/${album?.artist?._id || album?.artist?.id}`}
                                                  className={styles.artist}>{album?.artist?.name}</Link>
                                        )}
                                        {!load || !album?.releaseYear || !album?.genres?.length ? (
                                            <SkeletonBase width={150} height={20}/>
                                        ) : (
                                            <div className={styles.small}>
                                                <span className={styles.genre}>{album?.genres?.length ? (
                                                    album.genres[0].split(' ').map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(' ')
                                                ) : ''}</span>
                                                <span className={styles.releaseYear}>{album?.releaseYear}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className={`${styles.play} ${!album?.tracks?.length || !album?.tracks?.filter(t => !!t.audio).length ? styles.disabled : ''}`}
                                        onClick={() => handlePlay()}>
                                        <PlayIcon fill={'#1c1c1c'} rounded={true}/> Play
                                    </button>
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
                                        <SkeletonBase width={'100%'} height={52} borderRadius={8}/>
                                        <SkeletonBase width={'100%'} height={52} borderRadius={8}/>
                                        <SkeletonBase width={'100%'} height={52} borderRadius={8}/>
                                    </>
                                ) : album && album?.tracks?.length ? album?.tracks?.map((track, index) => (
                                    <div key={index} id={track?._id} onClick={() => setSelectedTrack(selectedTrack === track?._id ? null : track?._id)}
                                         className={`${styles.track} ${!track?.audio ? styles.disabled : ''} ${selectedTrack === track?._id ? styles.highlight : ''}`}>
                                        <div className={styles.id}>
                                            {contextTrack?._id === track?._id && isPlaying ? (
                                                <>
                                                    <span className={styles.playing}>
                                                        <span></span>
                                                        <span></span>
                                                    </span>
                                                    <button onClick={() => handlePlayPause(false)}>
                                                        <PauseIcon fill={process.env.ACCENT_COLOR}/>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span>
                                                        {index + 1}
                                                    </span>
                                                    <button onClick={() => handlePlay(track?._id)}>
                                                        <PlayIcon fill={process.env.ACCENT_COLOR} rounded={true}/>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <div className={styles.title}>
                                            {track?.title}
                                            {track?.explicit ? (
                                                <TooltipHandler title={'Explicit content'}>
                                                    <span className={styles.explicit}>
                                                        <ExplicitIcon/>
                                                    </span>
                                                </TooltipHandler>
                                            ) : ''}
                                        </div>
                                        <div className={styles.lastColumn}>
                                            <div
                                                className={styles.duration}>{track?.audio && track?.duration ? formatTime(track?.duration) : '--:--'}</div>
                                            <button>
                                                <OptionsIcon fill={track?.audio ? process.env.ACCENT_COLOR : '#eee'}/>
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