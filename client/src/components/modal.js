import {useContext, useEffect} from 'react'
import {ModalContext} from '@/contexts/modal'
import CustomScrollbar from '@/components/custom-scrollbar'
import styles from '@/styles/modals.module.sass'
import {CloseIcon} from '@/icons'

export default function Modal({children}) {
    const [modal, setModal] = useContext(ModalContext)

    useEffect(() => {
        const handleKeyUp = e => {
            if (e.code === 'Escape' && modal) setModal(null) // Close modal if Esc key is pressed
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
                    {/*<CustomScrollbar scrollbarPadding={8}>*/}
                        <button className={styles.close} onClick={() => setModal(null)}>
                            <CloseIcon/>
                        </button>
                        <div className={styles.content}>
                            {children}
                        </div>
                    {/*</CustomScrollbar>*/}
                </div>
            </div>
        </div>
    )
}