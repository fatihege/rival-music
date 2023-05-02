import {createContext, useEffect, useReducer, useRef, useState} from 'react'
import Wrapper from '@/components/wrapper'
import SidePanel from '@/components/side-panel'
import NowPlayingBar from '@/components/now-playing-bar'
import '@/styles/globals.sass'
import styles from '@/styles/general.module.sass'
import {SkeletonTheme} from 'react-loading-skeleton'

export const SidePanelResizingContext = createContext(false) // Context for side panel resizing state
export const SidePanelSpaceContext = createContext(false) // Context for side panel bottom padding
export const NPBarResizingContext = createContext(false) // Context for now playing bar resizing state
export const ProgressBarContext = createContext(false) // Context for progress bar changing state
export const ShowTrackPanel = createContext(false) // Context for showing track panel state

export const sidePanelSpaceReducer = (state, value) => { // Reducer for side panel bottom padding
    if (state !== value) return value
    else return state
}

export default function App({Component, pageProps}) {
    const [load, setLoad] = useState(false) // Load state
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
    const [showTrackPanel, setShowTrackPanel] = useState({ // Show track panel state
        active: false, // Is track panel active
        type: null, // Type of track panel to show
    })
    // const [sidePanelSpace, setSidePanelSpace] = useState(0) // Side panel bottom padding
    const [sidePanelSpace, dispatchSidePanelSpace] = useReducer(sidePanelSpaceReducer, 0) // Side panel bottom padding
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

    useEffect(() => {
        if (localStorage) setLoad(true) // If local storage is available, set load state to true

        window.addEventListener('mousemove', e => {
            if (isSidePanelResizingRef.current.active) { // If resizing side panel
                const {setWidth, MIN_WIDTH, MAX_WIDTH, isMinimized} = isSidePanelResizingRef.current // Get min width and max width of side panel
                const newWidth = e.clientX + isSidePanelResizingRef.current.offset // Calculate new width of side panel
                if (newWidth < MIN_WIDTH / 2 - 10) return setWidth(null, true) // If new width is less than half of min width minus 20, minimize side panel
                if (isMinimized && newWidth > MIN_WIDTH / 2 + 10) return setWidth(Math.max(Math.min(newWidth, MAX_WIDTH), MIN_WIDTH)) // If new width is greater than half of min width minus 20 and side panel is minimized, maximize side panel
                setWidth(Math.max(Math.min(newWidth, MAX_WIDTH), MIN_WIDTH)) // Set width of side panel
            } else if (isNPBarResizingRef.current.active) { // If resizing now playing bar
                const {setWidth, side, MIN_WIDTH, MAX_WIDTH} = isNPBarResizingRef.current // Get side, min width, and max width of now playing bar
                const newWidth = side === 1 ? window.innerWidth - e.clientX * 2 : window.innerWidth - (window.innerWidth - e.clientX) * 2 // Calculate new width of now playing bar
                setWidth(Math.max(Math.min(newWidth, MAX_WIDTH), MIN_WIDTH)) // Set width of now playing bar
            } else if (isProgressBarChangingRef.current.active) { // If changing progress bar
                isProgressBarChangingRef.current.setWidth(e) // Set width of progress bar
            }
        })

        window.addEventListener('mouseup', () => {
            if (isSidePanelResizingRef.current.active) setIsSidePanelResizing(false) // If resizing side panel, stop resizing
            else if (isNPBarResizingRef.current.active) setIsNPBarResizing(false) // If resizing now playing bar, stop resizing
            else if (isProgressBarChangingRef.current.active) setIsProgressBarChanging(false) // If changing progress bar, stop changing
        })

        window.addEventListener('dragstart', e => e.preventDefault())
    })

    return (
        <>
            <SkeletonTheme baseColor="rgba(0,0,0,.2)" highlightColor="rgba(50,50,50,.5)">
                <Wrapper load={load}>
                    <SidePanelSpaceContext.Provider value={[sidePanelSpace, dispatchSidePanelSpace]}>
                        <SidePanelResizingContext.Provider value={[isSidePanelResizing, setIsSidePanelResizing]}>
                            <ShowTrackPanel.Provider value={[showTrackPanel, setShowTrackPanel]}>
                                <div className={styles.main}>
                                    <SidePanel/>
                                    <div className={styles.content}>
                                        <Component {...pageProps}/>
                                    </div>
                                </div>
                            </ShowTrackPanel.Provider>
                        </SidePanelResizingContext.Provider>
                        <NPBarResizingContext.Provider value={[isNPBarResizing, setIsNPBarResizing]}>
                            <ProgressBarContext.Provider value={[isProgressBarChanging, setIsProgressBarChanging]}>
                                <NowPlayingBar/>
                            </ProgressBarContext.Provider>
                        </NPBarResizingContext.Provider>
                    </SidePanelSpaceContext.Provider>
                </Wrapper>
            </SkeletonTheme>
        </>
    )
}
