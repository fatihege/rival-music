import {createContext, useEffect, useRef, useState} from 'react'
import Hls from 'hls.js'

const REPEAT = { // Repeat value constants
    NO: 0,
    QUEUE: 1,
    ONE: 2,
}

const EXCLUDED_ELEMENTS = [
    'BUTTON',
    'INPUT',
    'TEXTAREA',
]

const AudioContext = createContext(null) // Create audio context

const AudioProvider = ({children}) => {
    const audioRef = useRef(null) // Audio element
    const [queue, setQueue] = useState([]) // Queue state
    const [queueIndex, setQueueIndex] = useState(0) // Queue index of active track
    const [shuffle, setShuffle] = useState(false) // Shuffle mode state
    const [loop, setLoop] = useState(REPEAT.NO) // Loop mode state
    const [isPlaying, _setIsPlaying] = useState(false) // Is playing state
    const [duration, _setDuration] = useState(0) // Track duration
    const [currentTime, setCurrentTime] = useState(0) // Current time
    const [volume, setVolume] = useState(1) // Volume level of audio
    const hlsRef = useRef(null) // HLS instance reference
    const isPlayingRef = useRef(isPlaying) // Is playing state reference
    const durationRef = useRef(duration) // Duration state reference

    const setIsPlaying = value => { // Set is playing state
        isPlayingRef.current = value
        _setIsPlaying(value)
    }

    const setDuration = value => { // Set duration state
        durationRef.current = value
        _setDuration(value)
    }

    useEffect(() => {
        if (!queue?.length) return // If queue is empty, return

        const audio = audioRef.current // Get audio reference
        const track = queue[queueIndex] // Get track from queue

        if (!audio || !track) return // If audio or track is not set, return
        const url = `${process.env.API_URL}/track/manifest/${track?.audio}` // Create track URL

        if (Hls.isSupported()) { // If HLS is supported by browser
            if (!hlsRef.current) { // If HLS reference is not set
                const hls = new Hls({ // Create HLS instance
                    debug: false,
                    enableWorker: true,
                    enableSoftwareAES: true,
                    maxBufferSize: 10 * 1024 * 1024,
                    maxBufferLength: 30,
                    maxMaxBufferLength: 600,
                    startLevel: -1,
                    levelLoadingRetry: 3,
                    lowLatencyMode: true,
                    manifestLoadPolicy: {
                        default: {
                            maxTimeToFirstByteMs: 5000,
                            maxLoadTimeMs: 10000,
                            timeoutRetry: {
                                maxNumRetry: 3,
                                retryDelayMs: 0,
                                maxRetryDelayMs: 1000,
                            },
                            errorRetry: {
                                maxNumRetry: 3,
                                retryDelayMs: 0,
                                maxRetryDelayMs: 1000,
                            },
                        }
                    },
                    fragLoadPolicy: {
                        default: {
                            maxTimeToFirstByteMs: 5000,
                            maxLoadTimeMs: 10000,
                            timeoutRetry: {
                                maxNumRetry: 3,
                                retryDelayMs: 0,
                                maxRetryDelayMs: 1000,
                            },
                            errorRetry: {
                                maxNumRetry: 3,
                                retryDelayMs: 0,
                                maxRetryDelayMs: 100,
                            },
                        },
                    },
                    decrypt: {
                        key: process.env.CRYPTO_KEY,
                        iv: process.env.CRYPTO_IV,
                        method: process.env.CRYPTO_ALGORITHM,
                    },
                })
                hls.loadSource(url) // Load track manifest
                hls.attachMedia(audio) // Attach media to the audio
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    audio.currentTime = 0 // Start audio from 0
                })
                hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                    setDuration(audio.duration) // Update track duration state when media is attached
                    if (isPlayingRef.current) audio.play() // Play the track if it is playing
                })
                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.error(event, data)
                    if (data.fatal) {
                        // switch (data.type) {
                        //     case Hls.ErrorTypes.NETWORK_ERROR:
                        //         hls.startLoad()
                        //         break
                        //     case Hls.ErrorTypes.MEDIA_ERROR:
                        //         hls.recoverMediaError()
                        //         break
                        //     default:
                        //         hls.destroy()
                        //         break
                        // }
                    }
                })
                hlsRef.current = hls // Update HLS instance reference to the hls instance
            } else {
                hlsRef.current.loadSource(url) // Load track manifest
            }
        } else if (audio.canPlayType('application/vnd.apple.mpegurl') && audio.src !== track) { // Otherwise, if browser supports mpeg files and audio element's source is not equals to track manifest URL
            audio.src = track // Set audio element's source to the track manifest URL
            audio.currentTime = 0 // Start audio from 0
            setDuration(audio.duration) // Update track duration state
            handlePlayPause(true) // Play the track
        }
    }, [queue, queueIndex]);

    useEffect(() => {
        const audio = audioRef.current // Get audio reference
        if (!audio) return // If audio is not set, return

        const handleMetaData = () => setDuration(audio.duration) // Update the track duration state
        const handleVolumeChange = () => setVolume(audio.volume) // Update the volume level
        const handlePlay = () => handlePlayPause(true) // Play the track
        const handlePause = () => handlePlayPause(false) // Pause the track

        const handleKeyDown = e => {
            if (!EXCLUDED_ELEMENTS.includes(e.target.tagName) && e.code === 'Space' || e.code === 'MediaPlayPause' || e.key === 'MediaPlayPause') {
                e.preventDefault()
                handlePlayPause(!isPlayingRef.current) // Toggle play/pause if space or media play/pause key pressed
            }
        }

        const localLoop = localStorage.getItem('loop') && !isNaN(parseInt(localStorage.getItem('loop'))) ? parseInt(localStorage.getItem('loop')) : REPEAT.NO // Get loop value from local storage
        handleLoop(localLoop) // Handle loop by local value

        const localShuffle = localStorage.getItem('shuffle') && !isNaN(Number(localStorage.getItem('shuffle'))) ? !!Number(localStorage.getItem('shuffle')) : false // Get shuffle value from local storage
        handleShuffle(localShuffle) // Handle shuffle by local value

        audio.addEventListener('loadedmetadata', handleMetaData)
        audio.addEventListener('volumechange', handleVolumeChange)
        audio.addEventListener('play', handlePlay)
        audio.addEventListener('pause', handlePause)
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            audio.removeEventListener('loadedmetadata', handleMetaData)
            audio.removeEventListener('volumechange', handleVolumeChange)
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('pause', handlePause)
            window.removeEventListener('keydown', handleKeyDown)
            if (hlsRef.current) hlsRef.current.destroy() // If there is an HLS instance, destroy it
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('loop', loop.toString()) // Update local storage value of loop mode state when it changes
    }, [loop])

    useEffect(() => {
        localStorage.setItem('shuffle', Number(shuffle).toString()) // Update local storage value of shuffle mode state when it changes
    }, [shuffle])

    useEffect(() => {
        handlePlayPause(true)
    }, [queueIndex])

    const handlePlayPause = state => {
        if (!durationRef.current) return
        if (typeof state !== 'boolean') setIsPlaying(!isPlayingRef.current) // Toggle play/pause if state value type is not set
        else setIsPlaying(state) // Otherwise, set is playing value to state

        const audio = audioRef.current // Get audio reference
        if (!audio) return // If audio is not set, return
        if (isPlayingRef.current) audio.play()
        else audio.pause()
    }

    const handleTimeUpdate = () => setCurrentTime(audioRef.current.currentTime) // Update current time state to audio's current time

    const handleEnded = (next = false) => {
        handleSeek(0) // Seek current time to 0

        if (loop === REPEAT.ONE && !next) handlePlayPause(true) // If loop mode is set to one, play the track
        else if (loop === REPEAT.QUEUE) { // If loop mode is set to queue
            if (queueIndex + 1 < queue.length) setQueueIndex(queueIndex + 1) // If queue index is less than queue length, increase queue index by 1
            else setQueueIndex(0) // Otherwise, set queue index to 0
        } else if (shuffle) { // If shuffle mode is set
            const tmpQueue = [...queue.filter(q => q?.id !== queue[queueIndex]?.id)] // Create temporary queue
            const randomIndex = Math.floor(Math.random() * tmpQueue.length) // Get random index
            const randomTrack = tmpQueue[randomIndex] // Get random track
            if (randomIndex !== queueIndex) setQueueIndex(queue.findIndex(q => q?.id === randomTrack?.id)) // If random index is not equals to queue index, set queue index to random index
            else handleEnded()
        } else if (queueIndex + 1 < queue.length) setQueueIndex(queueIndex + 1) // If queue index is less than queue length, increase queue index by 1
        else handlePlayPause(false) // Otherwise, pause the track
    }

    const handleSeek = time => {
        if (!durationRef.current) return

        setCurrentTime(time) // Update current time state by time
        audioRef.current.currentTime = time // Set audio element's current time to time
    }

    const handleVolumeUpdate = level => {
        setVolume(level / 100) // Map volume level to the range of 0-1 and update state
        audioRef.current.volume = level / 100 // Map volume level to the range of 0-1 and update audio element's volume
    }

    const handleLoop = level => {
        if (typeof level !== 'number') setLoop(loop + 1 > 2 ? 0 : loop + 1) // If level is not set, toggle loop modes
        else setLoop(level) // If it is, set loop mode by level
    }

    const handleShuffle = state => {
        if (typeof state !== 'boolean') setShuffle(!shuffle) // If state is not set, toggle shuffle mode
        else setShuffle(state) // Otherwise, set shuffle mode by state
    }

    return (
        <AudioContext.Provider value={{queue, setQueue, queueIndex, setQueueIndex, handlePlayPause, isPlaying, handleSeek, handleEnded, currentTime, durationRef, volume, handleVolumeUpdate, loop, handleLoop, shuffle, handleShuffle}}>
            {children}
            <audio ref={audioRef} controls onTimeUpdate={handleTimeUpdate} onEnded={() => handleEnded()} style={{display: 'none'}}></audio>
        </AudioContext.Provider>
    )
}

export {AudioContext, AudioProvider}