import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {ModalContext} from '@/contexts/modal'
import Slider from '@/components/slider'
import CustomScrollbar from '@/components/custom-scrollbar'
import ChangeProfileModal from '@/components/modals/change-profile'
import FollowersModal from '@/components/modals/followers'
import FollowedUsersModal from '@/components/modals/followed-users'
import {RGBtoHSL, RGBtoString} from '@/utils/color-converter'
import getUserData from '@/utils/get-user-data'
import {AddIcon} from '@/icons'
import styles from '@/styles/profile.module.sass'
import FavouriteArtistsModal from '@/components/modals/favourite-artists'

export default function ProfilePage() {
    const router = useRouter() // Use router
    const [user] = useContext(AuthContext) // Get user from auth context
    const [, setModal] = useContext(ModalContext) // Use modal context
    const [load, setLoad] = useState(false) // Is profile loaded
    const [profileColor, setProfileColor] = useState(null) // User's profile color
    const [accentColor, setAccentColor] = useState(null) // User's accent color
    const [playlists, setPlaylists] = useState([]) // Playlists of the user
    const [favArtistCount, setFavArtistCount] = useState(0) // User's favourite artists count
    const [followedCount, setFollowedCount] = useState(0) // User's followed users count
    const [followerCount, setFollowerCount] = useState(0) // User's followers count
    const [topTracks, _setTopTracks] = useState([]) // Top tracks of the user
    const topTracksRef = useRef(topTracks) // Reference for the top tracks

    const setTopTracks = value => { // Update top tracks state
        topTracksRef.current = value
        _setTopTracks(value)
    }

    useEffect(() => { // Fill top tracks array
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
        const userData = await getUserData(user.id, 'profileColor,accentColor,playlists,count:favouriteArtists,count:followedUsers,count:followers') // Get user's profile properties from API
        if (userData?.profileColor) setProfileColor(userData.profileColor) // If there is a profile color, update the profile color state
        if (userData?.accentColor) setAccentColor(userData.accentColor) // If there is an accent color, update the accent color state
        if (userData?.playlists && userData.playlists.length) setPlaylists(userData.playlists) // If the user has any playlist, update the playlists state
        if (typeof userData?.favouriteArtists === 'number') setFavArtistCount(userData.favouriteArtists) // If the user is following any artists, get their count
        if (typeof userData?.followedUsers === 'number') setFollowedCount(userData.followedUsers) // If the user is following any users, get their count
        if (typeof userData?.followers === 'number') setFollowerCount(userData.followers) // If the user has any followers, get their count
        setLoad(true) // Set load state to true
    }

    useEffect(() => {
        if (!user.token || !user.id) return // If token or id of the user is not defined, return
        if (user.loaded && !user.token) return router.push('/') // If user data is retrieved and the user has no token, return to the home page

        getUserInfo() // Otherwise, get user info from API
    }, [user])

    return (
        <>
            <Head>
                <title>Profile — Rival Music</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <div
                            className={`${!load ? styles.loading : ''} ${styles.userProfile} ${profileColor && RGBtoHSL(profileColor)[2] < 55 ? styles.white : ''}`}
                            style={profileColor ? {backgroundColor: RGBtoString(profileColor)} : {}}>
                            <div className={styles.image}
                                 style={!user.image ? accentColor ? {backgroundColor: RGBtoString(accentColor)} : {} : {}}>
                                {user.image ? <img src={`${process.env.IMAGE_CDN}/${user.image}`}/> : user.name ? <span
                                    style={!user.image ? {color: RGBtoString(profileColor || [255, 255, 255])} : {}}>{user?.name[0]?.toUpperCase()}</span> : ''}
                                <div className={styles.imageOverlay}
                                     onClick={() => setModal({canClose: true, active: <ChangeProfileModal/>})}>
                                    <AddIcon/>
                                    <span>Upload Photo</span>
                                </div>
                            </div>
                            <div className={styles.userInfo}
                                 style={accentColor ? {color: RGBtoString(accentColor)} : {}}>
                                <div className={styles.username}>
                                    <h3>{user?.name}</h3>
                                </div>
                                <div className={styles.fellows}>
                                    <div className={styles.count}
                                         onClick={() => setModal({canClose: true, active: <FollowersModal/>})}>
                                        <span>{followerCount} </span>Followers
                                    </div>
                                    <div className={styles.count}
                                         onClick={() => setModal({canClose: true, active: <FollowedUsersModal/>})}><span>{followedCount} </span>Following</div>
                                    <div className={styles.count}
                                         onClick={() => setModal({canClose: true, active: <FavouriteArtistsModal/>})}><span>{favArtistCount} </span>Favorite Artists</div>
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
