import {useEffect, useRef, useState} from 'react'
import styles from '@/styles/inputs.module.sass'

export default function  Input({type = 'text', name = '', placeholder = '', value = '', className = '', autoComplete = 'on', set = null, alert = null, onChange = () => {}, onBlur = () => {}}) {
    const inputRef = useRef() // Input reference
    const [focused, setFocused] = useState(false) // Is input focused

    useEffect(() => {
        if (!inputRef.current) return // If there is no input reference, return

        const handleFocus = () => setFocused(true)
        const handleBlur = () => setFocused(false)

        inputRef.current.addEventListener('focus', handleFocus)
        inputRef.current.addEventListener('blur', handleBlur)
    }, [inputRef])

    return (
        <div
            className={`${styles.input} ${focused ? styles.focused : ''} ${set.current.length ? styles.filled : ''} ${alert ? styles.danger : ''} ${className}`}
            onClick={() => inputRef.current?.focus()}
            style={focused ? {zIndex: 1} : {}}>
            <span className={styles.placeholder}>{placeholder}</span>
            <input type={type} name={name} ref={inputRef} onChange={e => {
                if (set) set.current = e.target.value
                onChange()
            }} autoComplete={autoComplete} onBlur={onBlur} defaultValue={value}/>
            {alert ? (
                <>
                    <div className={styles.alert}>i</div>
                    <div className={styles.alertMessage}>{alert}</div>
                </>
            ) : ''}
        </div>
    )
}