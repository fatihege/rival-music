import axios from 'axios'
import Head from 'next/head'
import {useContext, useEffect, useState} from 'react'
import Image from '@/components/image'
import {AuthContext} from '@/contexts/auth'
import {ModalContext} from '@/contexts/modal'
import Slider from '@/components/slider'
import CustomScrollbar from '@/components/custom-scrollbar'
import AskLoginModal from '@/components/modals/ask-login'
import ChangeProfileModal from '@/components/modals/change-profile'
import FollowersModal from '@/components/modals/followers'
import FollowedUsersModal from '@/components/modals/followed-users'
import FollowedArtistsModal from '@/components/modals/followed-artists'
import {RGBtoHSL, RGBtoString} from '@/utils/color-converter'
import getUserData from '@/utils/get-user-data'
import {AddIcon, LikeIcon} from '@/icons'
import styles from '@/styles/profile.module.sass'
import {LibraryContext} from '@/contexts/library'
import Skeleton from 'react-loading-skeleton'
import NotFoundPage from '@/pages/404'

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

export default function UserProfilePage({id}) {
    const [user] = useContext(AuthContext) // Get user from auth context
    const [library, , getUserLibrary] = useContext(LibraryContext) // Get library from library context
    const [, setModal] = useContext(ModalContext) // Use modal context
    const [activeUser, setActiveUser] = useState({})
    const [load, setLoad] = useState(false) // Is profile loaded

    const getUserInfo = async () => {
        if (!id) return // If ID property is not defined, return
        const userData = await getUserData(id, 'id,name,image,admin,profileColor,accentColor,playlists,count:followedArtists,count:followedUsers,count:followers', user?.id) // Get user's profile properties from API

        if (userData?.id) setActiveUser(userData) // If user's id is defined, set active user
        setLoad(true) // Set load state to true
    }

    useEffect(() => {
        if (user?.loaded && (!user?.id || !user?.token)) setModal({canClose: true, active: <AskLoginModal/>}) // If user is not logged in, show ask login modal
        if (!user?.loaded || !id) return // If user is not loaded, return

        getUserInfo() // Otherwise, get user info from API

        if (user?.loaded && user?.id === id) {
            getUserLibrary() // Get user library
            setActiveUser({...activeUser, ...user}) // If the current user's id is equal to active user's id, merge them
        }

        return () => { // When component is unmounted
            setLoad(false) // Set load state to false
            setActiveUser({}) // Reset active user
        }
    }, [id, user])

    const handleFollow = async () => {
        if (!user?.id || !user?.token) return // If user is not logged in, return

        try {
            const response = await axios.post(`${process.env.API_URL}/user/follow/user/${activeUser?._id || activeUser?.id}`, { // Send POST request to the API
                follow: activeUser?.following ? -1 : 1,
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            }) // Send POST request to the API
            if (response.data?.status === 'OK') setActiveUser({...activeUser, following: response.data?.followed, followers: response.data?.followers || 0}) // If there is following data in the response, set active user state
        } catch (e) {
            console.error(e)
        }
    }

    return load && (!activeUser?.id || !activeUser?.name) ? <NotFoundPage/> : load ? (
        <>
            <Head>
                <title>{user?.loaded && user?.id && user?.token && activeUser?.name ? `${activeUser.name} — ` : ''}Rival Music</title>
            </Head>
            {user?.loaded && user?.id && user?.token ? (
                <CustomScrollbar scrollbarPadding={4}>
                    <div className={styles.container}>
                        <div className={styles.content}>
                            <div
                                className={`${!load ? styles.loading : ''} ${styles.userProfile} ${activeUser.profileColor && RGBtoHSL(activeUser.profileColor)[2] < 55 ? styles.white : ''}`}
                                style={activeUser.profileColor ? {backgroundColor: RGBtoString(activeUser.profileColor)} : {}}>
                                <div className={styles.image}
                                     style={!activeUser.image ? activeUser.accentColor ? {backgroundColor: RGBtoString(activeUser.accentColor)} : {} : {}}>
                                    <Image src={activeUser?.image || '0'} width={200} height={200} format={'webp'} alt={activeUser.name}
                                        alternative={<span style={{color: RGBtoString(activeUser.profileColor || [255, 255, 255])}}>
                                            {activeUser?.name?.[0]?.toUpperCase()}</span>}
                                        loading={<Skeleton width={200} height={200} style={{top: '-5px'}}/>}/>
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
                                            <span>{activeUser.followers}</span>Followers
                                        </div>
                                        <div className={styles.count}
                                             onClick={() => setModal({canClose: true, active: <FollowedUsersModal id={activeUser.id}/>})}>
                                            <span>{activeUser.followedUsers}</span>Following
                                        </div>
                                        <div className={styles.count}
                                             onClick={() => setModal({canClose: true, active: <FollowedArtistsModal id={activeUser.id}/>})}>
                                            <span>{activeUser.followedArtists}</span>Followed Artists
                                        </div>
                                    </div>
                                    {user?.loaded && user?.id && user?.token && user?.id !== activeUser?.id && typeof activeUser?.following === 'boolean' ? (
                                        <button className={styles.followButton} onClick={handleFollow}>
                                            <LikeIcon stroke={'#1c1c1c'} fill={activeUser?.following ? '#1c1c1c' : 'none'}/>
                                            {activeUser?.following ? 'Following' : 'Follow'}
                                        </button>
                                    ) : ''}
                                </div>
                            </div>
                            <div className={styles.innerContent}>
                                {activeUser?.id === user?.id ? (
                                    <>
                                        <Slider type={'track'} title="Last listened tracks" items={library ? library.lastListenedTracks : null} />
                                        <Slider type={'album'} title="Liked albums" items={library ? library.albums : null} />
                                        <Slider type={'track'} title="Liked tracks" items={library ? library.tracks : null} />
                                    </>
                                ) : ''}
                            </div>
                        </div>
                    </div>
                </CustomScrollbar>
            ) : ''}
        </>
    ) : ''
}