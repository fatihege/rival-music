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
    const [isSidePanelResizing, _setIsSidePanelResizing] = useState({ // Side panel resizing state
        active: false, // Is resizing active
        MAX_WIDTH: 0, // Max width of side panel
        MIN_WIDTH: 0, // Min width of side panel
        offset: 0, // Offset of mouse from layout resizer
        setWidth: () => {}, // Function to set width of side panel
    })
    const [isNPBarResizing, _setIsNPBarResizing] = useState({ // Now playing bar resizing state
        active: false, // Is resizing active
        side: 0, // Side of now playing bar to resize
        MAX_WIDTH: 0, // Max width of now playing bar
        MIN_WIDTH: 0, // Min width of now playing bar
        offset: 0, // Offset of mouse from layout resizer
        setWidth: () => {}, // Function to set width of now playing bar
    })
    const [isProgressBarChanging, _setIsProgressBarChanging] = useState({ // Progress bar changing state
        active: false, // Is changing active
        setWidth: () => {}, // Function to set width of progress bar
    })
    const isSidePanelResizingRef = useRef(isSidePanelResizing) // Ref for side panel resizing state
    const isNPBarResizingRef = useRef(isNPBarResizing) // Ref for now playing bar resizing state
    const isProgressBarChangingRef = useRef(isProgressBarChanging) // Ref for progress bar changing state

    const setIsSidePanelResizing = value => { // Function to set side panel resizing state
        isSidePanelResizingRef.current = value
        _setIsSidePanelResizing(value)
    }

    const setIsNPBarResizing = value => { // Function to set now playing bar resizing state
        isNPBarResizingRef.current = value
        _setIsNPBarResizing(value)
    }

    const setIsProgressBarChanging = value => { // Function to set progress bar changing state
        isProgressBarChangingRef.current = value
        _setIsProgressBarChanging(value)
    }

    // TODO: Remove this
    let ran = false
    useEffect(() => {
        if (ran) return // Prevents this from running twice
        ran = true

        window.addEventListener('mousemove', e => {
            if (isSidePanelResizingRef.current.active) { // If resizing side panel
                const MIN_WIDTH = isSidePanelResizingRef.current.MIN_WIDTH // Get min width of side panel
                const MAX_WIDTH = isSidePanelResizingRef.current.MAX_WIDTH // Get max width of side panel
                const newWidth = e.clientX + isSidePanelResizingRef.current.offset // Calculate new width of side panel
                isSidePanelResizingRef.current.setWidth(Math.max(Math.min(newWidth, MAX_WIDTH), MIN_WIDTH)) // Set width of side panel
            } else if (isNPBarResizingRef.current.active) { // If resizing now playing bar
                const side = isNPBarResizingRef.current.side // Get side of now playing bar to resize
                const MIN_WIDTH = isNPBarResizingRef.current.MIN_WIDTH // Get min width of now playing bar
                const MAX_WIDTH = isNPBarResizingRef.current.MAX_WIDTH // Get max width of now playing bar
                const newWidth = side === 1 ? window.innerWidth - e.clientX * 2 : window.innerWidth - (window.innerWidth - e.clientX) * 2 // Calculate new width of now playing bar
                isNPBarResizingRef.current.setWidth(Math.max(Math.min(newWidth, MAX_WIDTH), MIN_WIDTH)) // Set width of now playing bar
            } else if (isProgressBarChangingRef.current.active) { // If changing progress bar
                isProgressBarChangingRef.current.setWidth(e) // Set width of progress bar
            }
        })

        window.addEventListener('mouseup', () => {
            if (isSidePanelResizingRef.current.active) setIsSidePanelResizing(false) // If resizing side panel, stop resizing
            else if (isNPBarResizingRef.current.active) setIsNPBarResizing(false) // If resizing now playing bar, stop resizing
            else if (isProgressBarChangingRef.current.active) setIsProgressBarChanging(false) // If changing progress bar, stop changing
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
