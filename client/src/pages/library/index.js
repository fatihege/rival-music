import Head from 'next/head'
import styles from '@/styles/home.module.sass'

export default function LibraryPage() {
    return (
        <>
            <Head>
                <title>Library {process.env.SEPARATOR} {process.env.APP_NAME}</title>
            </Head>
            <div className={styles.container}>
                <h1 className={styles.pageTitle}>LIBRARY PAGE</h1>
            </div>
        </>
    )
}