import styles from '@/styles/general.module.sass'

export default function Wrapper({load, children}) {
    return (
        <>
            <div className={`${styles.container} ${!load ? styles.hide : ''}`}>
                {children}
            </div>
        </>
    )
}