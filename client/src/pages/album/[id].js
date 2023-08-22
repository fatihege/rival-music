import Head from 'next/head'
import Link from 'next/link'
import {useContext, useEffect, useState} from 'react'
import CustomScrollbar from '@/components/custom-scrollbar'
import {AuthContext} from '@/contexts/auth'
import NotFoundPage from '@/pages/404'
import getAlbumData from '@/utils/get-album-data'
import {AlbumDefault, PlayIcon} from '@/icons'
import styles from '@/styles/album.module.sass'

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

export default function AlbumPage({id}) {
    const [load, setLoad] = useState(false) // Is profile loaded
    const [user] = useContext(AuthContext) // Get user data from AuthContext
    const [album, setAlbum] = useState({}) // Album data

    const getAlbumInfo = async () => {
        if (!id) return // If ID property is not defined, return
        const albumData = await getAlbumData(id) // Get album data from API
        if (albumData?._id || albumData?.id) setAlbum(albumData)
        setLoad(true) // Set load state to true
    }

    useEffect(() => {
        if (!id) return // If query ID is not defined, return
        getAlbumInfo() // Otherwise, get album info from API
    }, [id])

    return load && !album?._id && !album?.id ? <NotFoundPage/> : (
        <>
            <Head>
                <title>{album?.title ? `${album.title} — ` : ''}Rival Music</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <div className={styles.coverSection}>
                            <div className={styles.coverBackground}>
                                <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="100%">
                                    <filter id="displacementFilter">
                                        <feTurbulence type="turbulence" baseFrequency=".01 .01"
                                                      numOctaves="8" result="turbulence" seed="10"/>
                                        <feDisplacementMap in2="turbulence" in="SourceGraphic"
                                                           scale="60" xChannelSelector="R" yChannelSelector="B"/>
                                    </filter>
                                    <image href={`${process.env.IMAGE_CDN}/${album?.cover}`} width="110%" height="110%" x="-20" y="-20" preserveAspectRatio="none"
                                           filter="url(#displacementFilter)"/>
                                </svg>
                                <div className={styles.blurEffect}></div>
                            </div>
                            <div className={styles.coverWrapper}>
                                <div className={styles.cover}>
                                    {load && album?.cover ? <img src={`${process.env.IMAGE_CDN}/${album.cover}`} alt={`${album?.title} Cover`}/> : <AlbumDefault/>}
                                </div>
                                <div className={styles.albumInfo}>
                                    <div className={styles.info}>
                                        <h2 className={styles.title}>{album?.title}</h2>
                                        <div className={styles.small}>
                                            <Link href={'/artist/[id]'} as={`/artist/${album?.artist?._id || album?.artist?.id}`} className={styles.artist}>{album?.artist?.name}</Link>
                                            <span className={styles.releaseYear}>{album?.releaseYear}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}