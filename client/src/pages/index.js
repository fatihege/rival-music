import Head from 'next/head'
import Slider from '@/components/slider'
import styles from '@/styles/home.module.sass'

export default function HomePage() {
    const ALBUM_IMAGE = '/album_cover_6.jpg'

    return (
        <>
            <Head>
                <title>Rival Music</title>
            </Head>
            <div className={styles.container}>
                <div className={styles.content}>
                    <Slider title="Rhythm of Sounds"/>
                    <Slider title="Highlights of Your Music World"/>
                </div>
            </div>
        </>
    )
}
