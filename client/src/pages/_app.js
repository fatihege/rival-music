import {createContext, useEffect, useState} from 'react'
import Wrapper from '@/components/wrapper'
import SidePanel from '@/components/side-panel'
import NowPlayingBar from '@/components/now-playing-bar'
import '@/styles/globals.sass'
import styles from '@/styles/general.module.sass'
import {SkeletonTheme} from 'react-loading-skeleton'

export const ScrollbarContext = createContext(false) // Context for scrollbar state
export const ShowTrackPanel = createContext(false) // Context for showing track panel state

export default function App({Component, pageProps}) {
    const [load, setLoad] = useState(false) // Load state
    const [showTrackPanel, setShowTrackPanel] = useState({ // Show track panel state
        active: false, // Is track panel active
        type: null, // Type of track panel to show
    })

    useEffect(() => {
        if (localStorage) setLoad(true) // If local storage is available, set load state to true
        window.addEventListener('dragstart', e => e.preventDefault()) // Prevent drag and drop
    })

    return (
        <>
            <SkeletonTheme baseColor="rgba(0,0,0,.2)" highlightColor="rgba(50,50,50,.5)">
                <Wrapper load={load}>
                    <ScrollbarContext.Provider value={[]}>
                        <ShowTrackPanel.Provider value={[showTrackPanel, setShowTrackPanel]}>
                            <div className={styles.main}>
                                <SidePanel/>
                                <div className={styles.content}>
                                    <Component {...pageProps}/>
                                </div>
                            </div>
                        </ShowTrackPanel.Provider>
                        <NowPlayingBar/>
                    </ScrollbarContext.Provider>
                </Wrapper>
            </SkeletonTheme>
        </>
    )
}
