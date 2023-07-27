import {useEffect, useRef, useState} from 'react'
import styles from '@/styles/inputs.module.sass'

/**
 * @param {string} type
 * @param {string} name
 * @param {string} placeholder
 * @param {string} value
 * @param {string} className
 * @param {'on' | 'off'} autoComplete
 * @param {React.MutableRefObject<string>} set
 * @param {string | null} alert
 * @param {Function: any} onChange
 * @param {Function: any} onBlur
 * @param {Function: any} validator
 * @returns {JSX.Element}
 * @constructor
 */
export default function Textarea({
    name = '',
    placeholder = '',
    value = '',
    className = '',
    rows = 4,
    set = null,
    alert = null,
    onChange = () => {},
    onBlur = () => {},
    validator = () => {}
}) {
    /**
     * @type {React.MutableRefObject<HTMLTextAreaElement>}
     */
    const textareaRef = useRef() // Input reference
    const [focused, setFocused] = useState(false) // Is input focused
    const [inputAlert, setAlert] = useState(alert) // Input alert state

    useEffect(() => {
        if (!textareaRef.current) return // If there is no input reference, return

        const handleFocus = () => setFocused(true)
        const handleBlur = () => setFocused(false)

        textareaRef.current.addEventListener('focus', handleFocus)
        textareaRef.current.addEventListener('blur', handleBlur)
    }, [textareaRef])

    useEffect(() => { // On value state change
        if (textareaRef?.current) { // If there is an input
            textareaRef.current.value = value // Set input value
            onChange(value) // Trigger change event
        }
    }, [value])

    return (
        <div
            className={`${styles.input} ${styles.textarea} ${focused ? styles.focused : ''} ${set?.current.length || textareaRef.current?.value.length ? styles.filled : ''} ${inputAlert || alert ? styles.danger : ''} ${className}`}
            onClick={() => textareaRef.current?.focus()}
            style={focused ? {zIndex: 1} : {}}>
            <span className={styles.placeholder}>{placeholder}</span>
            <textarea name={name} ref={textareaRef} rows={rows} onChange={e => {
                if (set) set.current = e.target.value
                onChange(e.target.value)
                const validatorAlert = validator(e.target.value)
                if (validatorAlert) setAlert(validatorAlert)
                else setAlert(null)
            }} onBlur={onBlur} defaultValue={value}></textarea>
            {inputAlert || alert ? (
                <>
                    <div className={styles.alert}>i</div>
                    <div className={styles.alertMessage}>{inputAlert || alert}</div>
                </>
            ) : ''}
        </div>
    )
}