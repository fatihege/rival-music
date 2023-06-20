import {useContext} from 'react'
import {ModalContext} from '@/contexts/modal'
import styles from '@/styles/modals.module.sass'
import {CloseIcon} from '@/icons'

export default function Modal({children}) {
    const [, setModal] = useContext(ModalContext)

    const handleClose = () => setModal(null)

    return (
        <div className={styles.container}>
            <div className={styles.modal}>
                <div className={styles.wrapper}>
                    <button className={styles.close} onClick={handleClose}>
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