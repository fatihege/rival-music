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
import {LibraryProvider} from '@/contexts/library'
import {DragDropProvider} from '@/contexts/drag-drop'
import Wrapper from '@/components/wrapper'
import Main from '@/components/main'
import '@/styles/globals.sass'

export const useHistory = () => { // History hook
    const router = useRouter() // Get router
    const historyRef = useRef([]) // Create history reference
    const forwardRef = useRef([]) // Create forward reference

    useEffect(() => {
        historyRef.current.push({url: router.pathname, as: router.asPath}) // Push current path to the history when it changes
    }, [router.asPath])

    const goBack = () => {
        if (historyRef.current.length > 1) { // If history length is greater than 1
            forwardRef.current.unshift(historyRef.current.pop()) // Push the current path from the history to the first index of the forward list
            const historyItem = historyRef.current.pop()
            if (historyItem) router.push(historyItem.url, historyItem.as) // And change route to the last item of history
        }
    }

    const goForward = () => {
        const forwardItem = forwardRef.current.shift() // Get the first element of the forward list
        if (forwardRef.current.length || forwardItem) router.push(forwardItem.url, forwardItem.as) // If forward list is not empty, change route to its first element
    }

    const flushForward = () => forwardRef.current.splice(0, forwardRef.current.length) // Flush forward list

    return [goBack, goForward, flushForward]
}

export default function App({Component, pageProps}) {
    const [load, setLoad] = useState(false) // Load state

    useEffect(() => {
        if (localStorage) setLoad(true) // If local storage is available, set load state to true

        const handleDragStart = e => e.preventDefault() // Prevent dragging

        const handleWheel = e => { // Prevent zooming with ctrl + mouse wheel
            if (e.ctrlKey) e.preventDefault()
        }

        const handleTouchStart = e => { // Prevent zooming with two fingers
            if (e.touches.length > 1) e.preventDefault()
        }

        const handleKeyDown = e => { // Prevent zooming with ctrl + +, ctrl + -, ctrl + 0, ctrl + numpad_add, ctrl + numpad_subtract, ctrl + numpad_0
            if (e.ctrlKey && ['+', '-', '0', 'numpad_add', 'numpad_subtract', 'numpad_0'].includes(e.key)) e.preventDefault()
        }

        window.addEventListener('dragstart', handleDragStart)
        window.addEventListener('wheel', handleWheel, {passive: false})
        window.addEventListener('touchstart', handleTouchStart, {passive: false})
        window.addEventListener('keydown', handleKeyDown, {passive: false})

        return () => {
            window.removeEventListener('dragstart', handleDragStart)
            window.removeEventListener('wheel', handleWheel)
            window.removeEventListener('touchstart', handleTouchStart)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (
        <AlertProvider>
            <AuthProvider>
                <DragDropProvider>
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
                </DragDropProvider>
            </AuthProvider>
        </AlertProvider>
    )
}