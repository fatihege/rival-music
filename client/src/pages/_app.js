import {useRouter} from 'next/router'
import {useEffect, useRef, useState} from 'react'
import {SkeletonTheme} from 'react-loading-skeleton'
import {AuthProvider} from '@/contexts/auth'
import {QueueProvider} from '@/contexts/queue'
import {AudioProvider} from '@/contexts/audio'
import {TrackPanelProvider} from '@/contexts/track-panel'
import {NavigationBarProvider} from '@/contexts/navigation-bar'
import {ModalProvider} from '@/contexts/modal'
import {AlertProvider} from '@/contexts/alert'
import {DialogueProvider} from '@/contexts/dialogue'
import {TooltipProvider} from '@/contexts/tooltip'
import Wrapper from '@/components/wrapper'
import Main from '@/components/main'
import '@/styles/globals.sass'
import {LibraryProvider} from '@/contexts/library'

export const useHistory = () => { // History hook
    const router = useRouter() // Get router
    const historyRef = useRef([]) // Create history reference
    const forwardRef = useRef([]) // Create forward reference

    useEffect(() => {
        historyRef.current.push(router.asPath) // Push current path to the history when it changes
    }, [router.asPath])

    const goBack = () => {
        if (historyRef.current.length > 1) { // If history length is greater than 1
            forwardRef.current.unshift(historyRef.current.pop()) // Push the current path from the history to the first index of the forward list
            router.push(historyRef.current.pop()) // And change route to the last item of history
        }
    }

    const goForward = () => {
        if (forwardRef.current.length) router.push(forwardRef.current.shift()) // If forward list is not empty, change route to its first element
    }

    const flushForward = () => forwardRef.current.splice(0, forwardRef.current.length) // Flush forward list

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
        <AlertProvider>
            <AuthProvider>
                <SkeletonTheme baseColor={'rgb(33,33,33)'} highlightColor={'rgb(45,45,45)'}>
                    <Wrapper load={load}>
                        <TooltipProvider>
                                <DialogueProvider>
                                    <LibraryProvider>
                                        <AudioProvider>
                                            <ModalProvider>
                                                    <QueueProvider>
                                                        <TrackPanelProvider>
                                                            <NavigationBarProvider>
                                                                <Main>
                                                                    <Component {...pageProps}/>
                                                                </Main>
                                                            </NavigationBarProvider>
                                                        </TrackPanelProvider>
                                                    </QueueProvider>
                                            </ModalProvider>
                                        </AudioProvider>
                                    </LibraryProvider>
                                </DialogueProvider>
                        </TooltipProvider>
                    </Wrapper>
                </SkeletonTheme>
            </AuthProvider>
        </AlertProvider>
    )
}