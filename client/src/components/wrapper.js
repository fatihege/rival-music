import styles from '@/styles/general.module.sass'

export default function Wrapper({children}) {
    return (
        <>
            <div className={styles.container}>
                {children}
            </div>
        </>
    )
}