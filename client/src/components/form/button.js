import styles from '@/styles/inputs.module.sass'

export default function Button({value = '', type = 'primary', icon = null, className = ''}) {
    return (
        <button className={`${styles.button} ${styles[type] || ''} ${className}`}>
            {value}
            {icon || ''}
        </button>
    )
}