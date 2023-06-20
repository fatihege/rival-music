import styles from '@/styles/inputs.module.sass'

export default function Button({value = '', type = 'primary', icon = null, className = '', onClick = () => {}}) {
    return (
        <button className={`${styles.button} ${styles[type] || ''} ${className}`} onClick={onClick}>
            {value}
            {icon || ''}
        </button>
    )
}