import {createContext, useEffect, useRef, useState} from 'react'
import Wrapper from '@/components/wrapper'
import SidePanel from '@/components/side-panel'
import NowPlayingBar from '@/components/now-playing-bar'
import '@/styles/globals.sass'
import styles from '@/styles/general.module.sass'
import {SkeletonTheme} from 'react-loading-skeleton'
import TrackPanel from "@/components/track-panel";

export const ScrollbarContext = createContext(false) // Context for scrollbar
export const TrackPanelContext = createContext(false) // Context for track panel

export default function App({Component, pageProps}) {
    const [load, setLoad] = useState(false) // Load state
    const [trackPanel, _setTrackPanel] = useState({ // Track panel state
        active: false, // Is track panel active
        type: null, // Type of track panel to show
    })
    const trackPanelRef = useRef(trackPanel) // Reference to the track panel
    const setTrackPanel = value => { // Update track panel
        _setTrackPanel(value)
        trackPanelRef.current = value
    }

    useEffect(() => {
        if (localStorage) setLoad(true) // If local storage is available, set load state to true
        window.addEventListener('dragstart', e => e.preventDefault()) // Prevent drag and drop
        window.addEventListener('keyup', e => {
            if (e.key === 'Escape' && trackPanelRef.current.active) setTrackPanel({...trackPanelRef.current, active: false}) // Close track panel if Esc key is pressed
        })
    }, [])

    return (
        <>
            <SkeletonTheme baseColor="rgba(0,0,0,.2)" highlightColor="rgba(50,50,50,.5)">
                <Wrapper load={load}>
                    <ScrollbarContext.Provider value={[]}>
                        <TrackPanelContext.Provider value={[trackPanel, setTrackPanel]}>
                            {trackPanel.active ? <TrackPanel/> : ''}
                            <div className={styles.main}>
                                <SidePanel/>
                                <div className={styles.content}>
                                    <Component {...pageProps}/>
                                </div>
                            </div>
                            <NowPlayingBar/>
                        </TrackPanelContext.Provider>
                    </ScrollbarContext.Provider>
                </Wrapper>
            </SkeletonTheme>
        </>
    )
}
