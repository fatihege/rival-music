import axios from 'axios'
import {createContext, useContext, useEffect, useState} from 'react'
import {AudioContext} from '@/contexts/audio'
import {AuthContext} from '@/contexts/auth'
import {ModalContext} from '@/contexts/modal'
import AskLoginModal from '@/components/modals/ask-login'

const QueueContext = createContext(null)

const QueueProvider = ({children}) => {
    const [user] = useContext(AuthContext) // Get user from AuthContext
    const {
        queue,
        setQueue,
        queueIndex,
        setQueueIndex,
        isPlaying,
        handlePlayPause,
        handleEnded,
        loop,
        handleLoop,
        shuffle,
        handleShuffle,
        handleSeek,
        currentTime,
        dontChangeRef,
        handlePrevTrack,
        handleNextTrack,
    } = useContext(AudioContext) // Get required functions and states from AudioContext
    const [, setModal] = useContext(ModalContext) // Get setModal function from ModalContext
    const [showQueuePanel, setShowQueuePanel] = useState(false) // Is queue panel visible
    const [track, setTrack] = useState(null) // Track data
    const [isLiked, setIsLiked] = useState(false) // Is track liked

    const bindMediaSession = track => {
        if ('mediaSession' in navigator) { // If mediaSession is supported
            navigator.mediaSession.metadata = new MediaMetadata({ // Set mediaSession metadata
                title: track?.title,
                artist: track?.album?.artist?.name,
                album: track?.album?.title,
                artwork: [
                    {src: `${process.env.IMAGE_CDN}/${track?.album?.cover}?width=96&height=96&format=png`, sizes: '96x96', type: 'image/png'},
                    {src: `${process.env.IMAGE_CDN}/${track?.album?.cover}?width=128&height=128&format=png`, sizes: '128x128', type: 'image/png'},
                    {src: `${process.env.IMAGE_CDN}/${track?.album?.cover}?width=192&height=192&format=png`, sizes: '192x192', type: 'image/png'},
                    {src: `${process.env.IMAGE_CDN}/${track?.album?.cover}?width=256&height=256&format=png`, sizes: '256x256', type: 'image/png'},
                    {src: `${process.env.IMAGE_CDN}/${track?.album?.cover}?width=384&height=384&format=png`, sizes: '384x384', type: 'image/png'},
                    {src: `${process.env.IMAGE_CDN}/${track?.album?.cover}?width=512&height=512&format=png`, sizes: '512x512', type: 'image/png'},
                ]
            })
        }
    }

    useEffect(() => {
        if (queue[queueIndex]) { // If there is a track in the queue
            axios.get(`${process.env.API_URL}/track/info/${queue[queueIndex]?.id || queue[queueIndex]?._id}${user?.id && user?.token ? `?user=${user?.id}` : ''}`).then(res => { // Get track info from the queue
                if (res.data?.track) {
                    setTrack(res.data.track) // Set track data to the queue

                    if (res.data.track?.liked) setIsLiked(true) // If track is liked, set isLiked to true
                    else setIsLiked(false) // Otherwise, set isLiked to false

                    bindMediaSession(res.data.track) // Bind mediaSession
                }
            }).catch(e => console.error(e))
        }
    }, [queue, queueIndex])

    useEffect(() => {
        if (!user?.loaded) return
        if (!user?.id || !user?.token) { // If user is not logged in
            localStorage.removeItem('queue') // Remove queue from localStorage
            localStorage.removeItem('queueIndex') // Remove queueIndex from localStorage
            setTrack(null) // Set track data to null
            return setModal({ // Show ask login modal
                active: <AskLoginModal/>,
                canClose: true,
            })
        }

        if (localStorage.getItem('queue')) { // If there is a queue in localStorage
            try {
                if (JSON.stringify(queue.map(track => track.id || track._id)) === localStorage.getItem('queue')) return // If queue is not changed, return

                const localQueue = JSON.parse(localStorage.getItem('queue')) // Parse queue from localStorage
                const queueIndex = localStorage.getItem('queueIndex') ? parseInt(localStorage.getItem('queueIndex')) : 0 // Get queue index from localStorage
                axios.post(`${process.env.API_URL}/track/queue`, {queue: localQueue, onlyAudio: true}).then(res => { // Get track info from localStorage and request to the server
                    if (res.data?.queue) { // If there is a track
                        setQueue(res.data.queue) // Set queue with track data
                        setQueueIndex(queueIndex) // Update queue index
                    }
                }).catch(e => console.error(e))
            } catch (e) {
                console.error(e)
                localStorage.removeItem('queue') // Remove queue from localStorage
                localStorage.removeItem('queueIndex') // Remove queueIndex from localStorage
            }
        }
    }, [user])

    return (
        <QueueContext.Provider value={{
            queue,
            setQueue,
            queueIndex,
            setQueueIndex,
            isPlaying,
            handlePlayPause,
            handleEnded,
            loop,
            handleLoop,
            shuffle,
            handleShuffle,
            handleSeek,
            currentTime,
            showQueuePanel,
            setShowQueuePanel,
            track,
            setTrack,
            isLiked,
            setIsLiked,
            dontChangeRef,
            handlePrevTrack,
            handleNextTrack,
        }}>
            {children}
        </QueueContext.Provider>
    )
}

export {QueueContext, QueueProvider}