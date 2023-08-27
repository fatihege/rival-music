import axios from 'axios'
import {createContext, useContext, useEffect, useState} from 'react'
import {AudioContext} from '@/contexts/audio'
import {AuthContext} from '@/contexts/auth'

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
    } = useContext(AudioContext) // Get required functions and states from AudioContext
    const [track, setTrack] = useState(null) // Create track state
    const [isLiked, setIsLiked] = useState(false) // Create isLiked state

    useEffect(() => {
        if (track) localStorage.setItem('track', track._id) // Set track ID to localStorage
    }, [track])

    useEffect(() => {
        if (queue[queueIndex]) { // If there is a track in the queue
            axios.get(`${process.env.API_URL}/track/info/${queue[queueIndex]?.id || queue[queueIndex]?._id}${user?.id && user?.token ? `?user=${user?.id}` : ''}`).then(res => { // Get track info from the queue
                if (res.data?.track) {
                    setTrack(res.data.track) // Set track data to the queue
                    if (res.data.track?.liked) setIsLiked(true) // If track is liked, set isLiked to true
                    else setIsLiked(false) // Otherwise, set isLiked to false
                }
            })
        }
    }, [queue, queueIndex]);

    useEffect(() => {
        if (!user) return

        if (localStorage.getItem('track')) { // If there is a track ID in localStorage
            axios.get(`${process.env.API_URL}/track/info/${localStorage.getItem('track')}${user?.id && user?.token ? `?user=${user?.id}` : ''}`).then(res => { // Get track info from localStorage and request to the server
                if (res.data?.track) { // If there is a track
                    setTrack(res.data.track) // Set track data to the queue
                    setQueue([{id: res.data.track._id, audio: res.data.track.audio}]) // Set queue with track data
                    setQueueIndex(0) // Set queue index to 0
                    if (res.data.track?.liked) setIsLiked(true) // If track is liked, set isLiked to true
                    else setIsLiked(false) // Otherwise, set isLiked to false
                }
            })
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
            track,
            setTrack,
            isLiked,
            setIsLiked,
        }}>
            {children}
        </QueueContext.Provider>
    )
}

export {QueueContext, QueueProvider}