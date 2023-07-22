import styles from '@/styles/inputs.module.sass'

/**
 * @param {string} value
 * @param {'primary' | string} type
 * @param {JSX.Element<SVGElement>} icon
 * @param {string} className
 * @param {Function} onClick
 * @param {boolean} disabled
 * @returns {JSX.Element}
 * @constructor
 */
export default function Button({
   value = '',
   type = 'primary',
   icon = null,
   className = '',
   onClick = () => {},
   disabled = false
}) {
    return (
        <button disabled={disabled} className={`${styles.button} ${styles[type] || ''} ${className} ${disabled ? styles.disabled : ''}`} onClick={onClick}>
            {value}
            {icon || ''}
        </button>
    )
}