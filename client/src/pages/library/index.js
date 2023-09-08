import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect} from 'react'
import Link from '@/components/link'
import {AuthContext} from '@/contexts/auth'
import {LibraryContext} from '@/contexts/library'
import Slider from '@/components/slider'
import ExtensibleTracks from '@/components/extensible-tracks'
import styles from '@/styles/library.module.sass'

export default function LibraryPage() {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [library, setLibrary, getUserLibrary] = useContext(LibraryContext)

    useEffect(() => {
        if (user?.loaded && (!user?.id || !user?.token)) {
            router.push('/')
            return
        }

        getUserLibrary()
    }, [user])

    return user?.loaded && user?.id && user?.token ? (
        <>
            <Head>
                <title>Library — Rival Music</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>Your library</h1>
                <div className={styles.topSection}>
                    <Link href={'/library/playlists'}>
                        Playlists
                    </Link>
                    <Link href={'/library/tracks'}>
                        Favourite tracks
                    </Link>
                    <Link href={'/library/albums'}>
                        Favourite albums
                    </Link>
                </div>
                <ExtensibleTracks title="Your favourite tracks" items={library?.tracks} likedTracks={library?.tracks} set={setLibrary}/>
                <Slider type={'playlist'} title="Playlists created by you" items={library?.playlists || null}/>
                <Slider type={'playlist'} title="Your favourite playlists" items={library?.likedPlaylists || null}/>
                <Slider type={'album'} title="Your favourite albums" items={library?.albums || null}/>
            </div>
        </>
    ) : ''
}