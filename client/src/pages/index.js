import Head from 'next/head'
import Slider from '@/components/slider'
import CustomScrollbar from '@/components/custom-scrollbar'
import styles from '@/styles/home.module.sass'

export default function HomePage() {
    return (
        <>
            <Head>
                <title>Rival Music</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <h1 className={styles.pageTitle}>Listen Now</h1>
                        <Slider title="Rhythm of Sounds"/>
                        <Slider title="Highlights of Your Music World"/>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}
