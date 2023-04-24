import {createContext, useEffect, useRef, useState} from 'react'
import Wrapper from '@/components/wrapper'
import SidePanel from '@/components/side-panel'
import NowPlayingBar from '@/components/now-playing-bar'
import '@/styles/globals.sass'
import styles from '@/styles/general.module.sass'
import {SkeletonTheme} from "react-loading-skeleton";

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
            const MIN_WIDTH = isResizingRef.current.MIN_WIDTH
            const MAX_WIDTH = isResizingRef.current.MAX_WIDTH
            const newWidth = e.clientX + isResizingRef.current.offset
            isResizingRef.current.setWidth(Math.max(Math.min(newWidth, MAX_WIDTH), MIN_WIDTH))
        })

        window.addEventListener('mouseup', () => {
            if (!isResizingRef.current.active) return
            setIsResizing(false)
        })
    })

    return (
        <>
            <SkeletonTheme baseColor="rgba(0,0,0,.2)" highlightColor="rgba(50,50,50,.5)">
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
            </SkeletonTheme>
        </>
    )
}
