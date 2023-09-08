import Head from 'next/head'
import styles from '@/styles/home.module.sass'

export default function ExplorePage() {
    return (
        <>
            <Head>
                <title>Explore {process.env.SEPARATOR} {process.env.APP_NAME}</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>EXPLORE PAGE</h1>
            </div>
        </>
    )
}