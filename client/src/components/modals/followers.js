import {useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {ModalContext} from '@/contexts/modal'
import Link from '@/components/link'
import Image from '@/components/image'
import AskLoginModal from '@/components/modals/ask-login'
import getUserData from '@/utils/get-user-data'
import {RGBtoString} from '@/utils/color-converter'
import styles from '@/styles/modals.module.sass'

export default function FollowersModal({id}) {
    const [user] = useContext(AuthContext) // Get user data from the auth context
    const [, setModal] = useContext(ModalContext) // Use modal context for updating modal
    const [load, setLoad] = useState(false) // Is response loaded
    const [followers, setFollowers] = useState([]) // Followers state

    const getFollowers = async () => {
        const userData = await getUserData(id, 'populate:followers') // Get the followers of the user
        if (userData?.followers?.length) setFollowers(userData.followers) // If there is a data, update the state value
        setLoad(true) // Set the load state to true
    }

    useEffect(() => {
        if (!user.loaded) return
        if (!id) return setModal({canClose: true, active: null}) // If there is no user, close the modal and return
        getFollowers() // Otherwise, get followers from API
    }, [])

    useEffect(() => {
        if (!user.loaded) return
        if (!user?.id) setModal({canClose: true, active: <AskLoginModal/>}) // If user is not signed in, ask for login
    }, [user])

    return (
        <div className={styles.followers}>
            {load ? (
                followers.length ? followers.map((follower, i) => (
                    <Link key={i} className={styles.follower} href={'/profile/[id]'} as={`/profile/${follower._id}`} onClick={() => setModal({canClose: true, active: null})}>
                        <div className={styles.imageWrapper}>
                            <div className={styles.image}
                                 style={!follower.image && follower.accentColor ? {backgroundColor: RGBtoString(follower.accentColor)} : {}}>
                                {follower.image ? <img src={`${process.env.IMAGE_CDN}/${follower.image}`} alt={follower.name}/> :
                                    <span style={!follower.image && follower.profileColor ? {color: RGBtoString(follower.profileColor)} : {}}>{follower?.name?.[0]?.toUpperCase()}</span>}
                            </div>
                        </div>
                        <div className={styles.name}>{follower.name}</div>
                    </Link>
                )) : (
                    <span className={styles.noFollowers}>
                        {user.id === id ? 'No one is following you.' : 'No one is following this user.'}
                    </span>
                )
            ) : ''}
        </div>
    )
}