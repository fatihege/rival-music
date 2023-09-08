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
import {ContextMenuContext} from '@/contexts/context-menu'
import CustomScrollbar from '@/components/custom-scrollbar'
import AskLoginModal from '@/components/modals/ask-login'
import AlbumContextMenu from '@/components/context-menus/album'
import Tracks, {handlePlay} from '@/components/tracks'
import NotFoundPage from '@/pages/404'
import getAlbumData from '@/utils/get-album-data'
import {AlbumDefault, PlayIcon, LikeIcon} from '@/icons'
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
        handlePlayPause,
        track: contextTrack,
        isLiked,
    } = useContext(QueueContext) // Get queue data from QueueContext
    const [, , getUserLibrary] = useContext(LibraryContext) // Get user library
    const [, setModal] = useContext(ModalContext) // Get setModal function from ModalContext
    const [, setContextMenu] = useContext(ContextMenuContext) // Get setContextMenu function from ContextMenuContext
    const [album, setAlbum] = useState(null) // Album data

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
        }
    }, [id, user])

    const handleLikeAlbum = async () => {
        if (!album?._id) return // If album ID is not defined, return
        if (!user?.id || !user?.token) return setModal({ // If user is not logged in, open ask login modal
            active: <AskLoginModal/>,
            canClose: true,
        })

        try {
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
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (!contextTrack) return // If track is not defined, return

        if (album?.tracks?.find(t => t._id === contextTrack?._id)) { // If track is in the album
            if (isLiked && !album?.likes?.includes(contextTrack?._id)) setAlbum({
                ...album,
                likes: [...album.likes, contextTrack?._id]
            }) // If track is not liked, push track ID to the likes array
            else if (!isLiked && album?.likes?.includes(contextTrack?._id)) setAlbum({
                ...album,
                likes: album.likes.filter(t => t !== contextTrack?._id)
            }) // Otherwise, remove track ID from the likes array
        }
    }, [isLiked, contextTrack])

    const handleContextMenu = e => {
        e.preventDefault()
        e.stopPropagation()
        setContextMenu({
            menu: <AlbumContextMenu album={album}/>,
            x: e.clientX,
            y: e.clientY,
        })
    }

    return load && !album?._id && !album?.id ? <NotFoundPage/> : (
        <>
            <Head>
                <title>{album?.title ? `${album.title?.toString()} by ${album?.artist?.name?.toString()} ${process.env.SEPARATOR} ` : ''}{process.env.APP_NAME}</title>
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
                                <image
                                    href={`${process.env.IMAGE_CDN}/${album?.cover}?width=100&height=100&format=webp`}
                                    width="110%"
                                    height="110%" x="-20" y="-20" preserveAspectRatio="none"
                                    filter="url(#displacementFilter)"/> : ''}
                        </svg>
                    </div>
                    <div className={styles.content}>
                        <div className={styles.coverSection}>
                            <div className={styles.coverWrapper} onContextMenu={handleContextMenu}>
                                <div className={styles.cover}>
                                    <Image src={album?.cover || '0'} width={300} height={300} format={'webp'}
                                           alternative={<AlbumDefault/>}
                                           loading={<Skeleton style={{top: '-3px'}} height={300}/>}/>
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
                                            onClick={() => handlePlay(null, user, album, setModal, queue, setQueue, queueIndex, setQueueIndex, handlePlayPause)}>
                                            <PlayIcon fill={'#1c1c1c'} rounded={true}/> Play
                                        </button>
                                        {album !== null && (
                                            <button className={styles.like} onClick={handleLikeAlbum}>
                                                <LikeIcon fill={album?.liked ? '#1c1c1c' : 'none'} stroke={'#1c1c1c'}
                                                          strokeRate={1.25}/>
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
                            {!load ? (
                                <>
                                    <Skeleton width={'100%'} height={52} borderRadius={8}/>
                                    <Skeleton width={'100%'} height={52} borderRadius={8}/>
                                    <Skeleton width={'100%'} height={52} borderRadius={8}/>
                                </>
                            ) : <Tracks album={[album, setAlbum]}/>}
                        </div>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}