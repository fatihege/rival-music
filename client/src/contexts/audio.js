import axios from 'axios'
import {createContext, useContext, useEffect, useRef, useState} from 'react'
import Hls from 'hls.js'
import {AuthContext} from '@/contexts/auth'
import {LibraryContext} from '@/contexts/library'
import {AlertContext} from '@/contexts/alert'

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
    const [user] = useContext(AuthContext) // Get user from AuthContext
    const [, setAlert] = useContext(AlertContext) // Get setAlert function from AlertContext
    const [, , getLibrary] = useContext(LibraryContext) // Get library from LibraryContext
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
    const playTimeRef = useRef(0) // Play time reference
    const playTimeInterval = useRef(null) // Play time interval reference
    const dontChangeRef = useRef(false) // Don't change state reference
    const queueRef = useRef([]) // Queue state reference
    const queueIndexRef = useRef(0) // Queue index state reference
    const currentTimeRef = useRef(0) // Current time reference
    const loopRef = useRef(REPEAT.NO) // Loop state reference
    const shuffleRef = useRef(false) // Shuffle state reference

    const setIsPlaying = value => { // Set is playing state
        isPlayingRef.current = value
        _setIsPlaying(value)
    }

    const setDuration = value => { // Set duration state
        durationRef.current = value
        _setDuration(value)
    }

    useEffect(() => {
        queueRef.current = queue // Update queue state reference
        queueIndexRef.current = queueIndex // Update queue index state reference

        if (dontChangeRef.current) {
            dontChangeRef.current = false // Reset don't change state reference
            return
        }

        if (!queue?.length || queueIndex < 0) return // If queue is empty, return

        localStorage.setItem('queue', JSON.stringify(queue.map(q => q?.id || q?._id))) // Set queue to localStorage
        localStorage.setItem('queueIndex', queueIndex.toString()) // Set queue index to localStorage

        const audio = audioRef.current // Get audio reference
        const track = queue[queueIndex] // Get track from queue

        if (!audio || !track) return // If audio or track is not set, return
        const url = `${process.env.API_URL}/track/manifest/${track?.audio}` // Create track URL

        if (user?.loaded && user?.id && user?.token) {
            clearInterval(playTimeInterval.current)
            playTimeInterval.current = null

            playTimeInterval.current = setInterval(() => {
                if (isPlayingRef.current) playTimeRef.current++

                if (playTimeRef.current > (durationRef.current ? Math.floor(durationRef.current / 3) : 20)) {
                    clearInterval(playTimeInterval.current)
                    playTimeInterval.current = null

                    if (user?.loaded && user?.id && user?.token) {
                        axios.post(`${process.env.API_URL}/user/listened/${track?.id || track?._id}`, {}, {headers: {Authorization: `Bearer ${user?.token}`}})
                            .then(() => {
                                getLibrary()
                            })
                            .catch(e => console.error(e))
                    }
                }
            }, 1000)
        }

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
                    playTimeRef.current = 0
                })
                hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                    setDuration(audio.duration) // Update track duration state when media is attached
                    if (isPlayingRef.current) audio.play().catch(() => {}) // Play the track if it is playing
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
        } else {
            setAlert({
                active: true,
                title: 'Error',
                description: 'Your browser does not support this audio format.',
                button: 'OK',
                type: '',
            })
        }
    }, [queue, queueIndex])

    useEffect(() => {
        if (!user?.loaded) return // If user is not loaded, return

        if (!user?.id || !user?.token) { // If user id or token is not set
            audioRef.current?.pause() // Pause the track
            clearInterval(playTimeInterval.current)
            playTimeInterval.current = null
            localStorage.removeItem('queue')
            localStorage.removeItem('queueIndex')
        }
    }, [user])

    useEffect(() => {
        const audio = audioRef.current // Get audio reference
        if (!audio) return // If audio is not set, return

        const handleMetaData = () => setDuration(audio.duration) // Update the track duration state
        const handleVolumeChange = () => setVolume(audio.volume) // Update the volume level
        const handlePlay = () => handlePlayPause(true) // Play the track
        const handlePause = () => handlePlayPause(false) // Pause the track

        const handleKeyDown = e => {
            if (EXCLUDED_ELEMENTS.includes(e.target.tagName)) return // If target element is excluded, return

            if (e.code === 'Space' || e.code === 'MediaPlayPause' || e.key === 'MediaPlayPause') {
                e.preventDefault()
                handlePlayPause(!isPlayingRef.current) // Toggle play/pause if space or media play/pause key pressed
            }
        }

        if ('mediaSession' in navigator && navigator.mediaSession) {
            navigator.mediaSession.setActionHandler('play', () => handlePlayPause(true))
            navigator.mediaSession.setActionHandler('pause', () => handlePlayPause(false))
            navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevTrack())
            navigator.mediaSession.setActionHandler('nexttrack', () => handleNextTrack())
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
        loopRef.current = loop // Update loop state reference
        localStorage.setItem('loop', loop.toString()) // Update local storage value of loop mode state when it changes
    }, [loop])

    useEffect(() => {
        shuffleRef.current = shuffle // Update shuffle state reference
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
        if (isPlayingRef.current) audio.play().catch(() => {}) // Play the track if it is playing
        else audio.pause() // Otherwise, pause the track
    }

    const handleNextTrack = e => { // Play next track
        if (e?.preventDefault) e.preventDefault() // Prevent default event
        handleEnded(true) // Play next track if media next track key pressed
    }
    const handlePrevTrack = e => { // Play previous track
        if (e?.preventDefault) e.preventDefault() // Prevent default event
        if (currentTimeRef.current > 3) {
            handleSeek(0) // If current time is greater than 3 seconds, seek to 0
            handlePlayPause(true) // And play the track
        }
        else if (queueIndexRef.current - 1 >= 0) setQueueIndex(queueIndexRef.current - 1) // If queue index is greater than 0, decrease queue index by 1
        else {
            handleSeek(0) // Otherwise, seek to 0
            handlePlayPause(true) // And play the track
        }
    }

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime) // Update current time state to audio's current time
        currentTimeRef.current = audioRef.current.currentTime
    }

    const handleEnded = (next = false) => {
        handleSeek(0) // Seek current time to 0

        if (loopRef.current === REPEAT.ONE && !next) handlePlayPause(true) // If loop mode is set to one, play the track
        else if (loopRef.current === REPEAT.QUEUE) { // If loop mode is set to queue
            setQueueIndex(prev => prev + 1 < queueRef.current.length ? prev + 1 : 0) // If queue index is less than queue length, increase queue index by 1, otherwise, set queue index to 0
        } else if (shuffleRef.current) { // If shuffle mode is set
            const tmpQueue = [...queueRef.current?.filter(q => q?.id !== queueRef.current[queueIndexRef.current]?.id)] // Create temporary queue
            const randomIndex = Math.floor(Math.random() * tmpQueue.length) // Get random index
            const randomTrack = tmpQueue[randomIndex] // Get random track
            if (randomIndex !== queueIndex) setQueueIndex(queueRef.current.findIndex(q => q?.id === randomTrack?.id)) // If random index is not equals to queue index, set queue index to random index
            else handleEnded()
        } else if (queueIndexRef.current + 1 < queueRef.current.length) setQueueIndex(prev => prev + 1) // If queue index is less than queue length, increase queue index by 1
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
        <AudioContext.Provider value={{queue,
            setQueue,
            queueIndex,
            setQueueIndex,
            handlePlayPause,
            isPlaying,
            handleSeek,
            handleEnded,
            currentTime,
            durationRef,
            volume,
            handleVolumeUpdate,
            loop,
            handleLoop,
            shuffle,
            handleShuffle,
            dontChangeRef,
            handlePrevTrack,
            handleNextTrack,
        }}>
            {children}
            <audio ref={audioRef} controls onTimeUpdate={handleTimeUpdate} onEnded={() => handleEnded()} style={{display: 'none'}}></audio>
        </AudioContext.Provider>
    )
}

export {AudioContext, AudioProvider}