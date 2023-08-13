import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {ModalContext} from '@/contexts/modal'
import Slider from '@/components/slider'
import CustomScrollbar from '@/components/custom-scrollbar'
import ChangeProfileModal from '@/components/modals/change-profile'
import FollowersModal from '@/components/modals/followers'
import FollowedUsersModal from '@/components/modals/followed-users'
import FavouriteArtistsModal from '@/components/modals/favourite-artists'
import {RGBtoHSL, RGBtoString} from '@/utils/color-converter'
import getUserData from '@/utils/get-user-data'
import {AddIcon} from '@/icons'
import styles from '@/styles/profile.module.sass'

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

export default function UserProfilePage({id}) {
    const [user] = useContext(AuthContext) // Get user from auth context
    const [, setModal] = useContext(ModalContext) // Use modal context
    const [activeUser, setActiveUser] = useState({})
    const [load, setLoad] = useState(false) // Is profile loaded
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
        if (!id) return // If ID property is not defined, return
        const userData = await getUserData(id, 'id,name,image,admin,profileColor,accentColor,playlists,count:favouriteArtists,count:followedUsers,count:followers') // Get user's profile properties from API
        if (userData?.id) setActiveUser(userData) // If user's id is defined, set active user
        setLoad(true) // Set load state to true
    }

    useEffect(() => {
        if (!id) return // If query ID is not defined, return
        getUserInfo() // Otherwise, get user info from API
    }, [id])

    useEffect(() => {
        if (user && user.id === id) setActiveUser({...activeUser, ...user}) // If the current user's id is equal to active user's id, merge them
    }, [user])

    return (
        <>
            <Head>
                <title>{activeUser?.name ? `${activeUser.name} — ` : ''}Rival Music</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <div
                            className={`${!load ? styles.loading : ''} ${styles.userProfile} ${activeUser.profileColor && RGBtoHSL(activeUser.profileColor)[2] < 55 ? styles.white : ''}`}
                            style={activeUser.profileColor ? {backgroundColor: RGBtoString(activeUser.profileColor)} : {}}>
                            <div className={styles.image}
                                 style={!activeUser.image ? activeUser.accentColor ? {backgroundColor: RGBtoString(activeUser.accentColor)} : {} : {}}>
                                {activeUser.image ? <img src={`${process.env.IMAGE_CDN}/${activeUser.image}`} alt={activeUser.name}/> : activeUser.name ? <span
                                    style={!activeUser.image ? {color: RGBtoString(activeUser.profileColor || [255, 255, 255])} : {}}>{activeUser?.name[0]?.toUpperCase()}</span> : ''}
                                {activeUser?.id === user?.id ? (
                                    <div className={styles.imageOverlay}
                                         onClick={() => setModal({canClose: true, active: <ChangeProfileModal/>})}>
                                        <AddIcon/>
                                        <span>Upload Photo</span>
                                    </div>
                                ) : ''}
                            </div>
                            <div className={styles.userInfo}
                                 style={activeUser.accentColor ? {color: RGBtoString(activeUser.accentColor)} : {}}>
                                <div className={styles.username}>
                                    <h3>
                                        {activeUser?.name}
                                    </h3>
                                    {process.env.SHOW_ADMIN_BADGE && activeUser?.admin ? (
                                        <span className={styles.badge}>{process.env.IS_DEV_BADGE ? 'Developer' : 'Admin'}</span>
                                    ) : ''}
                                </div>
                                <div className={styles.fellows}>
                                    <div className={styles.count}
                                         onClick={() => setModal({canClose: true, active: <FollowersModal id={activeUser.id}/>})}>
                                        <span>{activeUser.followers} </span>Followers
                                    </div>
                                    <div className={styles.count}
                                         onClick={() => setModal({canClose: true, active: <FollowedUsersModal id={activeUser.id}/>})}>
                                        <span>{activeUser.followedUsers} </span>Following
                                    </div>
                                    <div className={styles.count}
                                         onClick={() => setModal({canClose: true, active: <FavouriteArtistsModal id={activeUser.id}/>})}>
                                        <span>{activeUser.favouriteArtists} </span>Favorite Artists
                                    </div>
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