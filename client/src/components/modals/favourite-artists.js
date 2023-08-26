import {useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {ModalContext} from '@/contexts/modal'
import Link from '@/components/link'
import AskLoginModal from '@/components/modals/ask-login'
import getUserData from '@/utils/get-user-data'
import styles from '@/styles/modals.module.sass'

export default function FavouriteArtistsModal({id}) {
    const [user] = useContext(AuthContext) // Get user data from the auth context
    const [, setModal] = useContext(ModalContext) // Use modal context for updating modal
    const [load, setLoad] = useState(false) // Is response loaded
    const [favouriteArtists, setFavouriteArtists] = useState([]) // Favourite artists state

    const getFavouriteArtists = async () => {
        const userData = await getUserData(user.id, 'favouriteArtists') // Get the favourite artists of the user
        if (userData?.favouriteArtists?.length) setFavouriteArtists(userData.favouriteArtists) // If there is a data, update the state value
        setLoad(true) // Set the load state to true
    }

    useEffect(() => {
        if (!user.loaded) return
        if (!user?.id) return setModal({canClose: true, active: <AskLoginModal/>}) // If user is not signed in, ask for login
        getFavouriteArtists() // Otherwise, get favourite artists from API
    }, [user])

    return (
        <div className={styles.favouriteArtists}>
            {load ? (
                favouriteArtists.length ? favouriteArtists.map((artist, i) => (
                    <Link key={i} className={styles.artist} href={'/'}>
                        <div className={styles.imageWrapper}>
                            <div className={styles.image}>
                                {artist.image ? <img src={`${process.env.IMAGE_CDN}/${artist.image}`} alt={artist.name}/> :
                                    <span>{artist?.name[0]?.toUpperCase()}</span>}
                            </div>
                        </div>
                        <div className={styles.name}>{artist.name}</div>
                    </Link>
                )) : (
                    <span className={styles.noFavouriteArtists}>
                        {user.id === id ? 'You don\'t have any favourite artists.' : 'This user don\'t have any favourite artists.'}
                    </span>
                )
            ) : ''}
        </div>
    )
}