import {createContext, useState} from 'react'
import Modal from '@/components/modal'

const ModalContext = createContext(null) // Create modal context

const ModalProvider = ({children}) => {
    const [modal, setModal] = useState(null) // Active modal state

    return (
        <ModalContext.Provider value={[modal, setModal]}>
            {modal ? (
                <Modal>
                    {modal}
                </Modal>
            ) : ''}
            {children}
        </ModalContext.Provider>
    )
}

export {ModalContext, ModalProvider}
