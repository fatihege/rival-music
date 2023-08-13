import {useContext, useEffect, useRef} from 'react'
import {DialogueContext} from '@/contexts/dialogue'
import Button from '@/components/form/button'
import styles from '@/styles/confirmation-dialogue.module.sass'

/**
 * @param {string} title
 * @param {string} description
 * @param {string} button
 * @param {'primary' | 'danger' | ''} type
 * @param {Function} callback
 * @returns {JSX.Element}
 * @constructor
 */
export default function ConfirmationDialogue({title = '', description = '', button = 'OK', type = '', callback = () => {}}) {
    const [dialogue, setDialogue] = useContext(DialogueContext) // Get the dialogue state from the dialogue context
    const confirmed = useRef(false) // Confirmed state

    useEffect(() => {
        const handleKeyUp = e => {
            if (e.code === 'Escape' && dialogue.active) setDialogue({...dialogue, active: null}) // Close dialogue if Esc key is pressed
        }

        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    const closeDialogue = () => setDialogue({...dialogue, active: false}) // Close dialogue

    const confirmDialogue = () => {
        if (confirmed.current) return // If confirmed, return
        confirmed.current = true // Set confirmed to true
        callback() // Trigger callback
        closeDialogue() // Close dialogue
    }

    return (
        <div className={styles.dialogueContainer}>
            <div className={styles.dialogue}>
                <div className={styles.dialogueHeader}>
                    <h3>{title}</h3>
                </div>
                <div className={styles.dialogueBody}>
                    <p>{description}</p>
                </div>
                <div className={styles.dialogueFooter}>
                    <Button type="" value="Cancel" className={styles.footerButton} onClick={closeDialogue}/>
                    <Button type={type} value={button} className={styles.footerButton} onClick={confirmDialogue}/>
                </div>
            </div>
        </div>
    )
}