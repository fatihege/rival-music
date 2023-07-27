import Head from 'next/head'
import {useEffect, useState} from 'react'
import CustomScrollbar from '@/components/custom-scrollbar'
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

export default function UserProfilePage({id}) {
    const [load, setLoad] = useState(false) // Is profile loaded
    const [artist, setArtist] = useState({}) // Artist data
    const [showDescription, setShowDescription] = useState(false) // Show full description

    const getArtistInfo = async () => {
        if (!id) return // If ID property is not defined, return
        const artistData = await getArtistData(id) // Get artist data from API
        if (artistData?._id) setArtist(artistData)
        setLoad(true) // Set load state to true
    }

    useEffect(() => {
        if (!id) return // If query ID is not defined, return
        getArtistInfo() // Otherwise, get artist info from API
    }, [id])

    return load && !artist?._id ? <NotFoundPage/> : (
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
                        </div>
                        <div className={styles.profileShadowEffect}>
                            {artist?.image ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="100%" height="90">
                                        <image href={`${process.env.IMAGE_CDN}/${artist.banner}`} width="110%" height="600" x="-5%" y="-500" preserveAspectRatio="none"/>
                                    </svg>
                                    <div className={styles.blurFilter}></div>
                                </>
                            ) : ''}
                        </div>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}