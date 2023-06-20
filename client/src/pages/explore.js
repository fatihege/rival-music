import Head from 'next/head'
import styles from '@/styles/home.module.sass'

export default function ExplorePage() {
    return (
        <>
            <Head>
                <title>Rival Music — Explore</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>EXPLORE PAGE</h1>
            </div>
        </>
    )
}