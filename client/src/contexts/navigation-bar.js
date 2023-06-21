import {createContext, useEffect, useRef, useState} from 'react'

const NavigationBarContext = createContext(null) // Context for navigation bar

const NavigationBarProvider = ({children}) => {
    const [width, setWidth] = useState(null) // Navigation bar width state
    const [showMenu, _setShowMenu] = useState(false) // Is menu shown state
    const menuRef = useRef() // Account menu reference
    const showMenuRef = useRef(showMenu) // Show menu state reference

    const setShowMenu = value => { // Set the show menu state and the reference value
        showMenuRef.current = value
        _setShowMenu(value)
    }

    return (
        <NavigationBarContext.Provider value={[width, setWidth, menuRef, showMenuRef, setShowMenu]}>
            {children}
        </NavigationBarContext.Provider>
    )
}

export {NavigationBarContext, NavigationBarProvider}
