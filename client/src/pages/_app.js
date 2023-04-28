import {createContext, useEffect, useRef, useState} from 'react'
import Wrapper from '@/components/wrapper'
import SidePanel from '@/components/side-panel'
import NowPlayingBar from '@/components/now-playing-bar'
import '@/styles/globals.sass'
import styles from '@/styles/general.module.sass'
import {SkeletonTheme} from 'react-loading-skeleton'

export const SidePanelResizingContext = createContext(false)
export const NPBarResizingContext = createContext(false)
export const ProgressBarContext = createContext(false)

export default function App({Component, pageProps}) {
    const [isSidePanelResizing, _setIsSidePanelResizing] = useState({
        active: false,
        MAX_WIDTH: 0,
        MIN_WIDTH: 0,
        offset: 0,
        setWidth: () => {
        },
    })
    const [isNPBarResizing, _setIsNPBarResizing] = useState({
        active: false,
        side: 0,
        MAX_WIDTH: 0,
        MIN_WIDTH: 0,
        offset: 0,
        setWidth: () => {
        },
    })
    const [isProgressBarChanging, _setIsProgressBarChanging] = useState({
        active: false,
        setWidth: () => {
        },
    })
    const isSidePanelResizingRef = useRef(isSidePanelResizing)
    const isNPBarResizingRef = useRef(isNPBarResizing)
    const isProgressBarChangingRef = useRef(isProgressBarChanging)

    const setIsSidePanelResizing = value => {
        isSidePanelResizingRef.current = value
        _setIsSidePanelResizing(value)
    }

    const setIsNPBarResizing = value => {
        isNPBarResizingRef.current = value
        _setIsNPBarResizing(value)
    }

    const setIsProgressBarChanging = value => {
        isProgressBarChangingRef.current = value
        _setIsProgressBarChanging(value)
    }

    // TODO: Remove this
    let ran = false
    useEffect(() => {
        if (ran) return
        ran = true

        window.addEventListener('mousemove', e => {
            if (isSidePanelResizingRef.current.active) {
                const MIN_WIDTH = isSidePanelResizingRef.current.MIN_WIDTH
                const MAX_WIDTH = isSidePanelResizingRef.current.MAX_WIDTH
                const newWidth = e.clientX + isSidePanelResizingRef.current.offset
                isSidePanelResizingRef.current.setWidth(Math.max(Math.min(newWidth, MAX_WIDTH), MIN_WIDTH))
            } else if (isNPBarResizingRef.current.active) {
                const side = isNPBarResizingRef.current.side
                const MIN_WIDTH = isNPBarResizingRef.current.MIN_WIDTH
                const MAX_WIDTH = isNPBarResizingRef.current.MAX_WIDTH
                const newWidth = side === 1 ? window.innerWidth - e.clientX * 2 : window.innerWidth - (window.innerWidth - e.clientX) * 2
                isNPBarResizingRef.current.setWidth(Math.max(Math.min(newWidth, MAX_WIDTH), MIN_WIDTH))
            } else if (isProgressBarChangingRef.current.active) {
                isProgressBarChangingRef.current.setWidth(e)
            }
        })

        window.addEventListener('mouseup', () => {
            if (isSidePanelResizingRef.current.active) setIsSidePanelResizing(false)
            else if (isNPBarResizingRef.current.active) setIsNPBarResizing(false)
            else if (isProgressBarChangingRef.current.active) setIsProgressBarChanging(false)
        })
    })

    return (
        <>
            <SkeletonTheme baseColor="rgba(0,0,0,.2)" highlightColor="rgba(50,50,50,.5)">
                <Wrapper>
                    <SidePanelResizingContext.Provider value={[isSidePanelResizing, setIsSidePanelResizing]}>
                        <div className={styles.main}>
                            <SidePanel/>
                            <div className={styles.content}>
                                <Component {...pageProps}/>
                            </div>
                        </div>
                    </SidePanelResizingContext.Provider>
                    <NPBarResizingContext.Provider value={[isNPBarResizing, setIsNPBarResizing]}>
                        <ProgressBarContext.Provider value={[isProgressBarChanging, setIsProgressBarChanging]}>
                            <NowPlayingBar/>
                        </ProgressBarContext.Provider>
                    </NPBarResizingContext.Provider>
                </Wrapper>
            </SkeletonTheme>
        </>
    )
}
