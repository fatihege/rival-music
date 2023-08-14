import Head from 'next/head'
import styles from '@/styles/home.module.sass'

export default function LibraryPage() {
    return (
        <>
            <Head>
                <title>Library — Rival Music</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>LIBRARY PAGE</h1>
            </div>
        </>
    )
}