import {createContext, useState} from 'react'
import Tooltip from '@/components/tooltip'

const TooltipContext = createContext(null) // Context for tooltip

const TooltipProvider = ({children}) => {
    const [tooltip, setTooltip] = useState({ // Properties of tooltip
        title: '',
        show: false,
        x: -100,
        y: -100,
        transformOrigin: '',
    })

    return (
        <TooltipContext.Provider value={[tooltip, setTooltip]}>
            <Tooltip/>
            {children}
        </TooltipContext.Provider>
    )
}

export {TooltipContext, TooltipProvider}