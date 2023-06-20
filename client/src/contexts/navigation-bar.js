import {createContext, useEffect, useRef, useState} from 'react'

const NavigationBarContext = createContext(null) // Context for navigation bar

const NavigationBarProvider = ({children}) => {
    const [width, setWidth] = useState(null) // Navigation bar width state

    return (
        <NavigationBarContext.Provider value={[width, setWidth]}>
            {children}
        </NavigationBarContext.Provider>
    )
}

export {NavigationBarContext, NavigationBarProvider}
