import axios from 'axios'
import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import Skeleton from 'react-loading-skeleton'
import {AuthContext} from '@/contexts/auth'
import Link from '@/components/link'
import Image from '@/components/image'
import Input from '@/components/form/input'
import nameGenre from '@/utils/name-genre'
import {AlbumDefault, SearchIcon} from '@/icons'
import styles from '@/styles/explore.module.sass'
import Slider from '@/components/slider'
import ExtensibleTracks from '@/components/extensible-tracks'

export default function ExplorePage() {
    const [user] = useContext(AuthContext) // Get user data from auth context
    const [triple, setTriple] = useState(null) // Triple state
    const [genres, setGenres] = useState(null) // Genres state
    const [search, setSearch] = useState('') // Search state
    const [trackResults, setTrackResults] = useState(null) // Track search results state
    const [searchResults, setSearchResults] = useState(null) // Search results state
    const [searchLoading, setSearchLoading] = useState(false) // Search loading state
    const searchTimeout = useRef(null) // Search timeout reference

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

    const handleSearch = value => {
        setSearch(value)
        clearTimeout(searchTimeout.current)
        if (value?.trim()?.length) {
            setSearchLoading(true)
            searchTimeout.current = setTimeout(() => {
                axios.get(`${process.env.API_URL}/explore/search/${value?.trim()}${user?.id ? `?user=${user?.id}` : ''}`).then(res => {
                    setSearchLoading(false)
                    setTrackResults(res.data?.data?.tracks)
                    setSearchResults(res.data?.data)
                }).catch(err => {
                    console.error(err)
                })
            }, 500)
        } else {
            setSearchLoading(false)
            setSearchResults(null)
        }
    }

    return (
        <>
            <Head>
                <title>Explore — Rival Music</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Explore</h1>
                <div className={styles.search}>
                    <div className={styles.icon}>
                        <SearchIcon stroke={'#eee'}/>
                    </div>
                    <Input className={styles.searchInput} placeholder={'Search a track, album, artist, playlist, or user'} onChange={value => handleSearch(value)}/>
                </div>
                {search?.trim()?.length ? (
                    <div>
                        {searchLoading ? (
                            <div className={styles.loading}>
                                <Skeleton height={50} width={50} style={{borderRadius: '50%'}}/>
                                <Skeleton height={50} width={50} style={{borderRadius: '50%'}}/>
                                <Skeleton height={50} width={50} style={{borderRadius: '50%'}}/>
                            </div>
                        ) : searchResults ? (
                            <>
                                <ExtensibleTracks title={'Tracks'} items={trackResults} likedTracks={trackResults.filter(track => !!track?.liked)} set={setTrackResults}/>
                                <Slider title="Albums" type={'album'} items={searchResults?.albums}/>
                                <Slider title="Artists" type={'artist'} items={searchResults?.artists}/>
                                <Slider title="Playlists" type={'playlist'} items={searchResults?.playlists}/>
                                <Slider title="Users" type={'user'} items={searchResults?.users}/>
                            </>
                        ) : (
                            <div className={styles.noResults}>
                                <h2 className={styles.title}>No results found</h2>
                                <p className={styles.description}>Try searching for something else</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </>
    )
}