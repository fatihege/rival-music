import {createContext, useState} from 'react'
import ConfirmationDialogue from '@/components/confirmation-dialogue'

const DialogueContext = createContext(null) // Create dialogue context

const DialogueProvider = ({children}) => {
    const [dialogue, setDialogue] = useState({ // Active dialogue state
        active: false,
        title: '',
        description: '',
        button: 'OK',
        type: '',
        callback: () => {},
    })

    return (
        <DialogueContext.Provider value={[dialogue, setDialogue]}>
            {dialogue.active ? (
                <ConfirmationDialogue title={dialogue.title} description={dialogue.description} button={dialogue.button} type={dialogue.type} callback={dialogue.callback}/>
            ) : ''}
            {children}
        </DialogueContext.Provider>
    )
}

export {DialogueContext, DialogueProvider}