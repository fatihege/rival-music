import axios from 'axios'
import Head from 'next/head'
import Link from '@/components/link'
import Image from '@/components/image'
import {useContext, useEffect, useState} from 'react'
import CustomScrollbar from '@/components/custom-scrollbar'
import Slider from '@/components/slider'
import {AuthContext} from '@/contexts/auth'
import NotFoundPage from '@/pages/404'
import getArtistData from '@/utils/get-artist-data'
import {LikeIcon, PlayIcon} from '@/icons'
import styles from '@/styles/artist.module.sass'
import Skeleton from 'react-loading-skeleton'
import ExtensibleTracks from '@/components/extensible-tracks'

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

export default function ArtistProfilePage({id}) {
    const [load, setLoad] = useState(false) // Is profile loaded
    const [user] = useContext(AuthContext) // Get user data from AuthContext
    const [artist, setArtist] = useState({}) // Artist data
    const [showDescription, setShowDescription] = useState(false) // Show full description
    const [essentialAlbums, setEssentialAlbums] = useState(null) // Essential albums
    const [essentialTracks, setEssentialTracks] = useState(null) // Essential tracks
    const [albums, setAlbums] = useState(null) // Artist albums

    const getArtistInfo = async () => {
        if (!id) return // If ID property is not defined, return
        const artistData = await getArtistData(id, user?.id) // Get artist data from API
        if (artistData?._id || artistData?.id) setArtist(artistData)
        setLoad(true) // Set load state to true
    }

    const getArtistAlbums = async () => {
        if (!id) return // If ID property is not defined, return

        try {
            const response = await axios.get(`${process.env.API_URL}/album/artist/${id}?sorting=last-released`) // Send GET request to the API
            if (response.data?.albums?.length) setAlbums(response.data.albums) // If there is albums data in the response, set albums state
            else setAlbums([]) // Otherwise, set albums state to empty array
        } catch (e) {
            console.error(e)
        }
    }

    const getEssentials = async () => {
        if (!id) return // If ID property is not defined, return

        try {
            const response = await axios.get(`${process.env.API_URL}/artist/essentials/${id}${user?.loaded && user?.id ? `?user=${user.id}` : ''}`) // Send GET request to the API
            if (response.data?.status === 'OK') { // If there is essentials data in the response
                setEssentialAlbums(response.data?.essentials?.mostListenedAlbums || []) // Set essential albums state
                setEssentialTracks(response.data?.essentials?.mostListenedTracks || []) // Set essential tracks state
            }
            else setAlbums([]) // Otherwise, set albums state to empty array
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (!id || !user?.loaded) return // If query ID is not defined, return

        getArtistInfo() // Get artist info from API
        getArtistAlbums() // Get artist albums from API
        getEssentials() // Get essentials from API

        return () => { // When component is unmounted
            setLoad(false) // Set load state to false
            setArtist({}) // Reset artist data
            setAlbums(null) // Reset albums data
        }
    }, [id, user])

    const handleFollow = async () => {
        if (!user?.id || !user?.token) return // If user is not logged in, return

        try {
            const response = await axios.post(`${process.env.API_URL}/user/follow/artist/${artist?._id || artist?.id}`, {
                follow: artist?.following ? -1 : 1,
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            }) // Send POST request to the API
            if (response.data?.status === 'OK') setArtist({...artist, following: response.data?.followed}) // If there is following data in the response, set artist state
        } catch (e) {
            console.error(e)
        }
    }

    return load && !artist?._id && !artist?.id ? <NotFoundPage/> : (
        <>
            <Head>
                <title>{artist?.name ? `${artist.name?.toString()} — ` : ''}Rival Music</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <div className={`${styles.profileSection} ${load && !artist?.banner ? styles.noBanner : ''}`}>
                            <div className={styles.banner}>
                                <Image src={artist.banner || '0'} width={2400} height={933} format={'webp'} alt={`${artist?.name} Banner`} loading={<Skeleton height={500} style={{top: '-3px'}}/>}/>
                            </div>
                            <div className={styles.artistInfo}>
                                <button className={styles.playButton}>
                                    <PlayIcon/>
                                </button>
                                <div className={styles.info}>
                                    <h2 className={styles.name}>{artist?.name}</h2>
                                    {load && artist?.description ? <div className={`${styles.description} ${showDescription ? styles.full : ''}`}>
                                        {!showDescription ? (
                                            <>
                                                {artist?.description?.slice(0, 50)?.trim()}...
                                                &nbsp;
                                                <span className={styles.showMore} onClick={() => setShowDescription(true)}>show more</span>
                                            </>
                                        ) : (
                                            <>
                                                {artist?.description}
                                                &nbsp;
                                                <span className={styles.showMore} onClick={() => setShowDescription(false)}>show less</span>
                                            </>
                                        )}
                                    </div> : ''}
                                    {user?.loaded && user?.id && user?.token && artist && typeof artist.following === 'boolean' ? (
                                        <button className={styles.followButton} onClick={handleFollow}>
                                            <LikeIcon stroke={'#1c1c1c'} fill={artist?.following ? '#1c1c1c' : 'none'}/>
                                            {artist?.following ? 'Following' : 'Follow'}
                                        </button>
                                    ) : ''}
                                </div>
                            </div>
                            {user?.id && user?.token && user?.admin && (
                                <Link href={'/admin/artist/[id]'} as={`/admin/artist/${artist?._id || artist?.id}`} className={styles.editButton}>Edit artist</Link>
                            )}
                        </div>
                        <div className={styles.profileShadowEffect}>
                            {artist?.banner ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="100%" height="90">
                                        <image href={`${process.env.IMAGE_CDN}/${artist.banner}?width=300&height=100&format=webp`} width="110%" height="600" x="-5%" y="-530" preserveAspectRatio="none"/>
                                    </svg>
                                    <div className={styles.blurFilter}></div>
                                </>
                            ) : ''}
                        </div>
                        <div className={styles.content}>
                            <ExtensibleTracks items={essentialTracks} title="Top Tracks" likedTracks={essentialTracks?.filter(t => t?.liked)} set={setEssentialTracks}/>
                            <Slider type={'album'} title="Essential Albums" items={essentialAlbums} noName={true} count={5}/>
                            <Slider type={'album'} title="Albums" items={albums}/>
                        </div>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}