import {createContext, useEffect, useRef, useState} from 'react'
import Wrapper from '@/components/wrapper'
import SidePanel from '@/components/side-panel'
import NowPlayingBar from '@/components/now-playing-bar'
import '@/styles/globals.sass'
import styles from '@/styles/general.module.sass'

export const SidePanelResizingContext = createContext(false)

export default function App({Component, pageProps}) {
    const [isResizing, _setIsResizing] = useState({
        active: false,
        setWidth: () => {},
    })
    const isResizingRef = useRef(isResizing)

    const setIsResizing = value => {
        isResizingRef.current = value
        _setIsResizing(value)
    }

    // TODO: Remove this
    let ran = false
    useEffect(() => {
        if (ran) return
        ran = true

        window.addEventListener('mousemove', e => {
            if (!isResizingRef.current.active) return
            isResizingRef.current.setWidth(e.clientX)
        })

        window.addEventListener('mouseup', () => {
            if (!isResizingRef.current.active) return
            setIsResizing(false)
        })
    })

    return (
        <>
            <Wrapper>
                <SidePanelResizingContext.Provider value={[isResizing, setIsResizing]}>
                    <div className={styles.main}>
                        <SidePanel/>
                        <div className={styles.content}>
                            <Component {...pageProps}/>
                        </div>
                    </div>
                </SidePanelResizingContext.Provider>
                <NowPlayingBar/>
            </Wrapper>
        </>
    )
}
