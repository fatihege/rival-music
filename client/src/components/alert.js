import {useContext, useEffect} from 'react'
import {AlertContext} from '@/contexts/alert'
import Button from '@/components/form/button'
import styles from '@/styles/alert.module.sass'

/**
 * @param {string} title
 * @param {string} description
 * @param {string} button
 * @param {'' | 'primary'} type
 * @returns {JSX.Element}
 * @constructor
 */
export default function Alert({title = '', description = '', button = 'OK', type = ''}) {
    const [alert, setAlert] = useContext(AlertContext) // Use alert context

    useEffect(() => {
        const handleKeyUp = e => {
            if (e.code === 'Escape' && alert.active && alert.canClose) setAlert({...alert, active: null}) // Close alert if Esc key is pressed and the alert is can be closed
        }

        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.alert}>
                <div className={styles.wrapper}>
                    <div className={styles.content}>
                        <h4 className={styles.title}>{title}</h4>
                        <p className={styles.description}>{description}</p>
                        <Button value={button} type={type} className={styles.button} onClick={() => setAlert({...alert, active: false})}/>
                    </div>
                </div>
            </div>
        </div>
    )
}