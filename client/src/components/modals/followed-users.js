import {useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {ModalContext} from '@/contexts/modal'
import Link from '@/components/link'
import AskLoginModal from '@/components/modals/ask-login'
import getUserData from '@/utils/get-user-data'
import {RGBtoString} from '@/utils/color-converter'
import styles from '@/styles/modals.module.sass'

export default function FollowedUsersModal({id}) {
    const [user] = useContext(AuthContext) // Get user data from the auth context
    const [, setModal] = useContext(ModalContext) // Use modal context for updating modal
    const [load, setLoad] = useState(false) // Is response loaded
    const [followedUsers, setFollowedUsers] = useState([]) // Followed users state

    const getFollowedUsers = async () => {
        const userData = await getUserData(id, 'populate:followedUsers') // Get the followed users of the user
        if (userData?.followedUsers?.length) setFollowedUsers(userData.followedUsers) // If there is a data, update the state value
        setLoad(true) // Set the load state to true
    }

    useEffect(() => {
        if (!user.loaded) return
        if (!id) return setModal({canClose: true, active: null}) // If there is no user, close the modal and return
        getFollowedUsers() // Otherwise, get followed users from API
    }, [])

    useEffect(() => {
        if (!user.loaded) return
        if (!user?.id) setModal({canClose: true, active: <AskLoginModal/>}) // If user is not signed in, ask for login
    }, [user])

    return (
        <div className={styles.fellows}>
            {load ? (
                followedUsers.length ? followedUsers.map((fellow, i) => (
                    <Link key={i} className={styles.fellow} href={'/profile/[id]'} as={`/profile/${fellow._id}`} onClick={() => setModal({canClose: true, active: null})}>
                        <div className={styles.imageWrapper}>
                            <div className={styles.image}
                                 style={!fellow.image && fellow.accentColor ? {backgroundColor: RGBtoString(fellow.accentColor)} : {}}>
                                {fellow.image ? <img src={`${process.env.IMAGE_CDN}/${fellow.image}`} alt={fellow.name}/> :
                                    <span style={!fellow.image && fellow.profileColor ? {color: RGBtoString(fellow.profileColor)} : {}}>{fellow?.name?.[0]?.toUpperCase()}</span>}
                            </div>
                        </div>
                        <div className={styles.name}>{fellow.name}</div>
                    </Link>
                )) : (
                    <span className={styles.noFollowers}>
                        {user.id === id ? 'You are not following anyone.' : 'This users is not following anyone.'}
                    </span>
                )
            ) : ''}
        </div>
    )
}