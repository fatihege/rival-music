import styles from '@/styles/inputs.module.sass'

export default function Button({value = '', type = 'primary', icon = null, className = '', onClick = () => {}, disabled = false}) {
    return (
        <button disabled={disabled} className={`${styles.button} ${styles[type] || ''} ${className} ${disabled ? styles.disabled : ''}`} onClick={onClick}>
            {value}
            {icon || ''}
        </button>
    )
}