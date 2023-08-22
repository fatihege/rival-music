import axios from 'axios'
import Head from 'next/head'
import Link from 'next/link'
import {useContext, useEffect, useState} from 'react'
import CustomScrollbar from '@/components/custom-scrollbar'
import Slider from '@/components/slider'
import {AuthContext} from '@/contexts/auth'
import NotFoundPage from '@/pages/404'
import getArtistData from '@/utils/get-artist-data'
import {PlayIcon} from '@/icons'
import styles from '@/styles/artist.module.sass'

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
    const [albums, setAlbums] = useState([]) // Artist albums

    const getArtistInfo = async () => {
        if (!id) return // If ID property is not defined, return
        const artistData = await getArtistData(id) // Get artist data from API
        if (artistData?._id || artistData?.id) setArtist(artistData)
        setLoad(true) // Set load state to true
    }

    const getArtistAlbums = async () => {
        if (!id) return // If ID property is not defined, return

        try {
            const response = await axios.get(`${process.env.API_URL}/album/artist/${id}`) // Send GET request to the API
            if (response.data?.albums) {
                response.data.albums = response.data.albums.map(album => ({...album, type: 'album'})) // Add type property to each album
                setAlbums(response.data.albums) // If there is albums data in the response, set albums state
            }
        } catch (e) {
            console.error(e)
        }
    }

    useEffect(() => {
        if (!id) return // If query ID is not defined, return

        getArtistInfo() // Get artist info from API
        getArtistAlbums() // Get artist albums from API
    }, [id])

    return load && !artist?._id && !artist?.id ? <NotFoundPage/> : (
        <>
            <Head>
                <title>{artist?.name ? `${artist.name} — ` : ''}Rival Music</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <div className={`${styles.profileSection} ${load && !artist?.banner ? styles.noBanner : ''}`}>
                            <div className={styles.banner}>
                                {load && artist?.banner ? <img src={`${process.env.IMAGE_CDN}/${artist.banner}`} alt={`${artist?.name} Banner`}/> : ''}
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
                                        <image href={`${process.env.IMAGE_CDN}/${artist.banner}`} width="110%" height="600" x="-5%" y="-530" preserveAspectRatio="none"/>
                                    </svg>
                                    <div className={styles.blurFilter}></div>
                                </>
                            ) : ''}
                        </div>
                        <div className={styles.albums}>
                            <Slider title="Latest Albums" items={albums}/>
                        </div>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}