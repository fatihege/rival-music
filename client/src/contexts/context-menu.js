import {createContext, useRef, useEffect, useState} from 'react'

const ContextMenuContext = createContext(null)

const ContextMenuProvider = ({children}) => {
    const [contextMenu, _setContextMenu] = useState({
        menu: null,
        x: -9999,
        y: -9999,
    })
    const contextMenuRef = useRef(contextMenu)

    const setContextMenu = value => {
        contextMenuRef.current = value
        _setContextMenu(value)
    }

    useEffect(() => {
        const handleCloseContextMenu = () => setContextMenu({
            menu: null,
            x: -9999,
            y: -9999,
        })

        const disableScroll = e => {
            if (contextMenuRef.current?.menu) e.preventDefault()
        }

        window.addEventListener('wheel', disableScroll, {passive: false})
        window.addEventListener('touchmove', disableScroll, {passive: false})
        window.addEventListener('click', handleCloseContextMenu)
        window.addEventListener('contextmenu', handleCloseContextMenu)

        return () => {
            window.removeEventListener('wheel', disableScroll)
            window.removeEventListener('touchmove', disableScroll)
            window.removeEventListener('click', handleCloseContextMenu)
            window.removeEventListener('contextmenu', handleCloseContextMenu)
        }
    }, []);

    return (
        <ContextMenuContext.Provider value={[contextMenu, setContextMenu]}>
            {children}
            {contextMenu.menu || ''}
        </ContextMenuContext.Provider>
    )
}

export {ContextMenuContext, ContextMenuProvider}