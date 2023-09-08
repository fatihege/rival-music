import axios from 'axios'
import Head from 'next/head'
import {useEffect, useState} from 'react'
import Skeleton from 'react-loading-skeleton'
import Link from '@/components/link'
import Image from '@/components/image'
import nameGenre from '@/utils/name-genre'
import {AlbumDefault} from '@/icons'
import styles from '@/styles/explore.module.sass'

export default function ExplorePage() {
    const [triple, setTriple] = useState(null)
    const [genres, setGenres] = useState(null)

    useEffect(() => {
        if (!triple)
            axios.get(`${process.env.API_URL}/explore/popular-triple`).then(res => {
                setTriple(res.data?.data)
            }).catch(err => {
                console.error(err)
            })
    }, [triple])

    useEffect(() => {
        if (!genres)
            axios.get(`${process.env.API_URL}/explore/genres`).then(res => {
                setGenres(res.data?.genres)
            }).catch(err => {
                console.error(err)
            })
    }, [genres])

    return (
        <>
            <Head>
                <title>Explore — Rival Music</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Explore</h1>
                <div className={styles.triple}>
                    {triple?.track && triple?.album && triple?.artist ? (
                        <><Link href={'/album/[id]'} as={`/album/${triple?.track?.album?._id}#${triple?.track?._id}`}>
                            {triple?.track?.album?.cover ? (
                                <div className={styles.background}>
                                        <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="100%" height="100%">
                                            <image href={`${process.env.IMAGE_CDN}/${triple?.track?.album?.cover}?width=200&height=200&format=webp`} width="100%"
                                                   height="100%" x="0" y="0" preserveAspectRatio="none"/>
                                        </svg>
                                </div>
                            ) : ''}
                            <div className={styles.image}>
                                <Image src={triple?.track?.album?.cover || '0'} width={200} height={200} format={'webp'}
                                       alt={''} alternative={<AlbumDefault/>}
                                       loading={<Skeleton height={200} width={200} style={{top: '-3px'}}/>}/>
                            </div>
                            <div className={styles.info}>
                                <h4 className={styles.tag}>Most Popular Track</h4>
                                <h2 className={styles.title}>{triple?.track?.title}</h2>
                                <h3 className={styles.artist}>{triple?.track?.album?.artist?.name}</h3>
                            </div>
                        </Link>
                            <Link href={'/album/[id]'} as={`/album/${triple?.album?._id}`}>
                                {triple?.album?.cover ? (
                                    <div className={styles.background}>
                                        <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="100%" height="100%">
                                            <image href={`${process.env.IMAGE_CDN}/${triple?.album?.cover}?width=200&height=200&format=webp`} width="100%"
                                                   height="100%" x="0" y="0" preserveAspectRatio="none"/>
                                        </svg>
                                    </div>
                                ) : ''}
                                <div className={styles.image}>
                                    <Image src={triple?.album?.cover || '0'} width={200} height={200} format={'webp'}
                                           alt={''} alternative={<AlbumDefault/>}
                                           loading={<Skeleton height={200} width={200} style={{top: '-3px'}}/>}/>
                                </div>
                                <div className={styles.info}>
                                    <h4 className={styles.tag}>Most Popular Album</h4>
                                    <h2 className={styles.title}>{triple?.album?.title}</h2>
                                    <h3 className={styles.artist}>{triple?.album?.artist?.[0]?.name}</h3>
                                </div>
                            </Link>
                            <Link href={'/artist/[id]'} as={`/artist/${triple?.artist?._id}`}>
                                {triple?.artist?.image ? (
                                    <div className={styles.background}>
                                        <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="100%" height="100%">
                                            <image href={`${process.env.IMAGE_CDN}/${triple?.artist?.image}?width=200&height=200&format=webp`} width="100%"
                                                   height="100%" x="0" y="0" preserveAspectRatio="none"/>
                                        </svg>
                                    </div>
                                ) : ''}
                                <div className={styles.image}>
                                    <Image src={triple?.artist?.image || '0'} width={200} height={200} format={'webp'}
                                           alt={''} alternative={<AlbumDefault/>}
                                           loading={<Skeleton height={200} width={200} style={{top: '-3px'}}/>}/>
                                </div>
                                <div className={styles.info}>
                                    <h4 className={styles.tag}>Most Popular Artist</h4>
                                    <h2 className={styles.title}>{triple?.artist?.name}</h2>
                                </div>
                            </Link>
                        </>
                    ) : ''}
                </div>
                {genres?.length ? (
                    <div className={styles.genres}>
                        <h2 className={styles.pageTitle}>Genres</h2>
                        <div className={styles.genresList}>
                            {genres?.map((genre, index) => (
                                <Link href={'/genre/[genre]'} as={`/genre/${genre?.toLowerCase()}`} key={index} className={styles.genre}>
                                    {nameGenre(genre)}
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : ''}
            </div>
        </>
    )
}