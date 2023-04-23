import Head from 'next/head'
import Slider from '@/components/slider'
import styles from '@/styles/home.module.sass'

export default function HomePage() {
    return (
        <>
            <Head>
                <title>Rival Music</title>
            </Head>
            <div className={styles.container}>
                <div className={styles.blurryBackground}>
                    <div className={styles.color}></div>
                    <div className={styles.color}></div>
                    <div className={styles.color}></div>
                </div>
                <div className={styles.content}>
                    <div className={styles.forYouSection}>
                        <Slider title="For you"/>
                    </div>
                </div>
            </div>
        </>
    )
}
