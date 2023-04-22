import Link from 'next/link'
import styles from '@/styles/side-panel.module.sass'
import {LogoWhite} from '@/icons'

export default function SidePanel() {
    return (
        <>
            <div className={styles.sidePanel}>
                <div className={styles.logo}>
                    <LogoWhite/>
                </div>
                <div className={styles.links}>
                    <Link href="/">
                    </Link>
                </div>
            </div>
        </>
    )
}