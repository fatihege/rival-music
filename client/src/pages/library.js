import Head from 'next/head'
import styles from '@/styles/home.module.sass'

export default function LibraryPage() {
    return (
        <>
            <Head>
                <title>Rival Music — Library</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>LIBRARY PAGE</h1>
            </div>
        </>
    )
}