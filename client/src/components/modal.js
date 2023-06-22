import {useContext, useEffect} from 'react'
import {ModalContext} from '@/contexts/modal'
import {CloseIcon} from '@/icons'
import styles from '@/styles/modals.module.sass'

export default function Modal({children}) {
    const [modal, setModal] = useContext(ModalContext)

    useEffect(() => {
        const handleKeyUp = e => {
            if (e.code === 'Escape' && modal.active && modal.canClose) setModal({...modal, active: null}) // Close modal if Esc key is pressed and the modal is can be closed
        }

        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    return (
        <div className={styles.container}>
            <div className={styles.modal}>
                <div className={styles.wrapper}>
                    <button className={styles.close} onClick={() => modal.canClose ? setModal({...modal, active: null}) : false}>
                        <CloseIcon/>
                    </button>
                    <div className={styles.content}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}