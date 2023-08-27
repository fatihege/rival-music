import styles from '@/styles/inputs.module.sass'

export default function Checkbox({label, name, checked, onChange}) {
    return (
        <div className={styles.checkbox}>
            <input type="checkbox" id={name} checked={checked} onChange={onChange}/>
            <label htmlFor={name}>
                {label}
                <span className={styles.checkmark}></span>
            </label>
        </div>
    )
}