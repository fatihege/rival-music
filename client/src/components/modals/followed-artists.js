import {useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {ModalContext} from '@/contexts/modal'
import Link from '@/components/link'
import Image from '@/components/image'
import AskLoginModal from '@/components/modals/ask-login'
import getUserData from '@/utils/get-user-data'
import styles from '@/styles/modals.module.sass'

export default function FavouriteArtistsModal({id}) {
    const [user] = useContext(AuthContext) // Get user data from the auth context
    const [, setModal] = useContext(ModalContext) // Use modal context for updating modal
    const [load, setLoad] = useState(false) // Is response loaded
    const [followedArtists, setFollowedArtists] = useState([]) // Followed artists state

    const getFavouriteArtists = async () => {
        const userData = await getUserData(id, 'populate:followedArtists') // Get the favourite artists of the user
        if (userData?.followedArtists?.length) setFollowedArtists(userData.followedArtists) // If there is a data, update the state value
        setLoad(true) // Set the load state to true
    }

    useEffect(() => {
        if (!user.loaded) return
        if (!user?.id) return setModal({canClose: true, active: <AskLoginModal/>}) // If user is not signed in, ask for login
        getFavouriteArtists() // Otherwise, get favourite artists from API
    }, [user])

    return (
        <div className={styles.followedArtists}>
            {load ? (
                followedArtists.length ? followedArtists.map((artist, i) => (
                    <Link key={i} href={'/artist/[id]'} as={`/artist/${artist?._id}`} className={styles.artist}
                          onClick={() => setModal({canClose: true, active: null})}>
                        <div className={styles.imageWrapper}>
                            <div className={`${styles.image} ${!artist?.image ? styles.backgroundWhite : ''}`}>
                                <Image src={artist?.image} alt={artist.name} width={40} height={40}
                                       alternative={<span>{artist?.name?.[0]?.toUpperCase()}</span>}/>
                            </div>
                        </div>
                        <div className={styles.name}>{artist.name}</div>
                    </Link>
                )) : (
                    <span className={styles.noFollowedArtists}>
                        {user.id === id ? 'You are not following any artists.' : 'This user is not following any artist.'}
                    </span>
                )
            ) : ''}
        </div>
    )
}