import {useEffect, useRef, useState} from 'react'
import styles from '@/styles/inputs.module.sass'

export default function Input({type = 'text', name = '', placeholder = '', className = '', autoComplete = 'on'}) {
    const inputRef = useRef() // Input reference
    const [focused, setFocused] = useState(false) // Is input focused
    const [value, setValue] = useState('') // Input value

    useEffect(() => {
        if (!inputRef.current) return // If there is no input reference, return

        const handleFocus = () => setFocused(true)
        const handleBlur = () => setFocused(false)

        inputRef.current.addEventListener('focus', handleFocus)
        inputRef.current.addEventListener('blur', handleBlur)
    }, [inputRef])

    return (
        <div
            className={`${styles.input} ${focused ? styles.focused : ''} ${value.length ? styles.filled : ''} ${className}`}
            onClick={() => inputRef.current?.focus()}
            style={focused ? {zIndex: 1} : {}}>
            <span className={styles.placeholder}>{placeholder}</span>
            <input type={type} name={name} ref={inputRef} onChange={e => setValue(e.target.value)} autoComplete={autoComplete}/>
        </div>
    )
}