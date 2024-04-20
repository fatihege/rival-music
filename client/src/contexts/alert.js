import {createContext, useState} from 'react'
import Alert from '@/components/alert'

const AlertContext = createContext(null) // Create alert context

const AlertProvider = ({children}) => {
    const [alert, setAlert] = useState({ // Active alert state
        active: false,
        title: '',
        description: '',
        button: 'OK',
        type: '',
    })

    return (
        <AlertContext.Provider value={[alert, setAlert]}>
            {alert.active ? (
                <Alert title={alert.title} description={alert.description} button={alert.button} type={alert.type}/>
            ) : ''}
            {children}
        </AlertContext.Provider>
    )
}

export {AlertContext, AlertProvider}