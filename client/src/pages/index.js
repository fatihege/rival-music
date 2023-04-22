import Head from 'next/head'
import styles from '@/styles/home.module.sass'

export default function HomePage() {
    return (
        <>
            <Head>
                <title>Rival Music</title>
            </Head>
            <div className={styles.container}>
                <h1>HOME PAGE</h1>
            </div>
        </>
    )
}
