import {useRouter} from 'next/router'
import Head from 'next/head'
import styles from '@/styles/error.module.sass'
import Button from '@/components/form/button'

export default function NotFoundPage() {
    const router = useRouter()

    return (
        <>
            <Head>
                <title>Page Not Found — Rival Music</title>
            </Head>
            <div className={styles.errorContainer}>
                <h2 className={styles.title}>Page Not Found</h2>
                <Button type={''} value="Return to Home" className={styles.button} onClick={() => router.push('/')}/>
            </div>
        </>
    )
}