import {useRouter} from 'next/router'
import {useEffect, useRef, useState} from 'react'
import {AuthProvider} from '@/contexts/auth'
import {AudioProvider} from '@/contexts/audio'
import {TrackPanelProvider} from '@/contexts/track-panel'
import Wrapper from '@/components/wrapper'
import SidePanel from '@/components/side-panel'
import NowPlayingBar from '@/components/now-playing-bar'
import {SkeletonTheme} from 'react-loading-skeleton'
import NavigationBar from '@/components/navigation-bar'
import '@/styles/globals.sass'
import styles from '@/styles/general.module.sass'

export const useHistory = () => {
    const router = useRouter()
    const historyRef = useRef([])
    const forwardRef = useRef([])

    useEffect(() => {
        historyRef.current.push(router.asPath)
    }, [router.asPath])

    const goBack = () => {
        if (historyRef.current.length > 1) {
            forwardRef.current.unshift(historyRef.current.pop())
            router.push(historyRef.current.pop())
        }
    }

    const goForward = () => {
        if (forwardRef.current.length) router.push(forwardRef.current.shift())
    }

    const flushForward = () => forwardRef.current.splice(0, forwardRef.current.length)

    return [goBack, goForward, flushForward]
}

export default function App({Component, pageProps}) {
    const [load, setLoad] = useState(false) // Load state

    useEffect(() => {
        if (localStorage) setLoad(true) // If local storage is available, set load state to true

        const handleDragStart = e => e.preventDefault() // Prevent dragging

        window.addEventListener('dragstart', handleDragStart)

        return () => {
            window.removeEventListener('dragstart', handleDragStart)
        }
    }, [])

    return (
        <AuthProvider>
            <SkeletonTheme baseColor="rgba(0,0,0,.2)" highlightColor="rgba(50,50,50,.5)">
                <Wrapper load={load}>
                    <AudioProvider>
                        <TrackPanelProvider>
                            <div className={styles.main}>
                                <SidePanel/>
                                <div className={styles.content}>
                                    <NavigationBar/>
                                    <div className={styles.innerContent}>
                                        <Component {...pageProps}/>
                                    </div>
                                </div>
                            </div>
                            <NowPlayingBar/>
                        </TrackPanelProvider>
                    </AudioProvider>
                </Wrapper>
            </SkeletonTheme>
        </AuthProvider>
    )
}
