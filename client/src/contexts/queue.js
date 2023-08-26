import axios from 'axios'
import {createContext, useContext, useEffect, useState} from 'react'
import {AudioContext} from '@/contexts/audio'

const QueueContext = createContext(null)

const QueueProvider = ({children}) => {
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
    } = useContext(AudioContext)
    const [track, setTrack] = useState(null)

    useEffect(() => {
        if (track) localStorage.setItem('track', track._id)
    }, [track])

    useEffect(() => {
        if (queue[queueIndex]) {
            axios.get(`${process.env.API_URL}/track/info/${queue[queueIndex].id}`).then(res => {
                if (res.data?.track) setTrack(res.data.track) // Set track data to the queue
            })
        }
    }, [queue, queueIndex]);

    useEffect(() => {
        if (localStorage.getItem('track')) {
            axios.get(`${process.env.API_URL}/track/info/${localStorage.getItem('track')}`).then(res => {
                if (res.data?.track) {
                    setTrack(res.data.track) // Set track data to the queue
                    setQueue([{id: res.data.track._id, audio: res.data.track.audio}])
                    setQueueIndex(0)
                }
            })
        }
    }, [])

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
            setTrack
        }}>
            {children}
        </QueueContext.Provider>
    )
}

export {QueueContext, QueueProvider}