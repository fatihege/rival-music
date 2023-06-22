import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {ModalContext} from '@/contexts/modal'
import Slider from '@/components/slider'
import CustomScrollbar from '@/components/custom-scrollbar'
import ChangeProfileModal from '@/components/modals/change-profile'
import {HEXtoHSL} from '@/utils/color-converter'
import {AddIcon} from '@/icons'
import styles from '@/styles/profile.module.sass'

export default function ProfilePage() {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [, setModal] = useContext(ModalContext)
    const [profileBackground, setProfileBackground] = useState(null)
    const [playlists, setPlaylists] = useState([])
    const [favArtistCount, setFavArtistCount] = useState(0)
    const [followedCount, setFollowedCount] = useState(0)
    const [followerCount, setFollowerCount] = useState(0)

    const [topTracks, _setTopTracks] = useState([])
    const topTracksRef = useRef(topTracks)

    const setTopTracks = value => {
        topTracksRef.current = value
        _setTopTracks(value)
    }

    useEffect(() => {
        for (let i = 0; i < 2; i++)
            for (let id = 1; id <= 6; id++)
                setTopTracks([...topTracksRef.current, {
                    id: id + i * 6,
                    name: id === 6 ? 'Ride The Lightning' : id === 5 ? 'Fear of the Dark (2015 Remaster)' : id === 4 ? 'Hells Bells' : id === 3 ? 'The Devil in I' : id === 2 ? 'Heaven and Hell - 2009 Remaster' : 'Seek & Destroy - Remastered',
                    artist: id === 5 ? 'Iron Maiden' : id === 4 ? 'AC/DC' : id === 3 ? 'Slipknot' : id === 2 ? 'Black Sabbath' : 'Metallica',
                    image: id === 6 ? '/album_cover_6.jpg' : id === 5 ? '/album_cover_5.jpg' : id === 4 ? '/album_cover_4.jpg' : id === 3 ? '/album_cover_3.jpg' : id === 2 ? '/album_cover_2.jpg' : '/album_cover_1.jpg',
                }])
    }, [])

    const getUserInfo = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/user/?id=${user.id}&props=profileBackground,playlists,count:favouriteArtists,count:followedUsers,count:followers`)
            if (!response.data || !response.data.user) return

            const {user: userData} = response.data

            if (userData.profileBackground) setProfileBackground(userData.profileBackground)
            if (userData.playlists && userData.playlists.length) setPlaylists(userData.playlists)
            if (userData.favouriteArtists) setFavArtistCount(userData.favouriteArtists)
            if (userData.followedUsers) setFollowedCount(userData.followedUsers)
            if (userData.followers) setFollowerCount(userData.followers)
        } catch (e) {
        }
    }

    useEffect(() => {
        if (!user.token || !user.id) return
        if (user.loaded && !user.token) return router.push('/')

        getUserInfo()
    }, [user])

    return (
        <>
            <Head>
                <title>Profile — Rival Music</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <div className={`${styles.userProfile} ${profileBackground && HEXtoHSL(profileBackground)[2] < 50 ? styles.white : ''}`} style={profileBackground ? {backgroundColor: profileBackground} : {}}>
                            <div className={styles.image}>
                                {user.image ? <img src={`${process.env.IMAGE_CDN}/${user.image}`}/> : user.name ? user?.name[0]?.toUpperCase() : ''}
                                <div className={styles.imageOverlay} onClick={() => setModal({canClose: true, active: <ChangeProfileModal/>})}>
                                    <AddIcon/>
                                    <span>Upload Photo</span>
                                </div>
                            </div>
                            <div className={styles.userInfo}>
                                <div className={styles.username}>
                                    <h3>{user?.name}</h3>
                                </div>
                                <div className={styles.fellows}>
                                    <div className={styles.count}><span>{followerCount} </span>Followers</div>
                                    <div className={styles.count}><span>{followedCount} </span>Following</div>
                                    <div className={styles.count}><span>{favArtistCount} </span>Favorite Artists</div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.innerContent}>
                            <Slider title="Top Tracks" items={topTracksRef.current}/>
                        </div>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}
