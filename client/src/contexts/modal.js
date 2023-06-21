import {createContext, useState} from 'react'
import Modal from '@/components/modal'

const ModalContext = createContext(null) // Create modal context

const ModalProvider = ({children}) => {
    const [modal, setModal] = useState({ // Active modal state
        active: null,
        canClose: true,
    })

    return (
        <ModalContext.Provider value={[modal, setModal]}>
            {modal.active ? (
                <Modal>
                    {modal.active}
                </Modal>
            ) : ''}
            {children}
        </ModalContext.Provider>
    )
}

export {ModalContext, ModalProvider}
