import {createContext, useEffect, useRef, useState} from 'react'
import Hls from 'hls.js'
import Wrapper from '@/components/wrapper'
import SidePanel from '@/components/side-panel'
import NowPlayingBar from '@/components/now-playing-bar'
import {SkeletonTheme} from 'react-loading-skeleton'
import TrackPanel from '@/components/track-panel'
import '@/styles/globals.sass'
import styles from '@/styles/general.module.sass'

export const AudioContext = createContext(null) // Context for audio
export const ScrollbarContext = createContext(null) // Context for scrollbar
export const TrackPanelContext = createContext(null) // Context for track panel

const REPEAT = { // Repeat value constants
    NO: 0,
    QUEUE: 1,
    ONE: 2,
}

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

    const audioRef = useRef(null) // Audio element
    const [queue, setQueue] = useState([`${process.env.API_URL}/track/manifest/track_1.m4a`]) // Queue state
    const [queueIndex, setQueueIndex] = useState(0) // Queue index of active track
    const [shuffle, setShuffle] = useState(false) // Shuffle mode state
    const [loop, setLoop] = useState(0) // Loop mode state
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
        if (localStorage) setLoad(true) // If local storage is available, set load state to true

        const handleMetaData = () => setDuration(audioRef.current.duration) // Update the track duration state
        const handleVolumeChange = () => setVolume(audioRef.current.volume) // Update the volume level
        const handlePlay = () => handlePlayPause(true) // Play the track
        const handlePause = () => handlePlayPause(false) // Pause the track

        const handleDragStart = e => e.preventDefault() // Prevent dragging

        const handleKeyUp = e => {
            if (e.code === 'Escape' && trackPanelRef.current.active) setTrackPanel({...trackPanelRef.current, active: false}) // Close track panel if Esc key is pressed
        }

        const handleKeyDown = e => {
            if (e.code === 'Space' || e.code === 'MediaPlayPause' || e.key === 'MediaPlayPause') handlePlayPause(!isPlayingRef.current) // Toggle play/pause if space or media play/pause key pressed
        }

        const localLoop = localStorage.getItem('loop') && !isNaN(parseInt(localStorage.getItem('loop'))) ? parseInt(localStorage.getItem('loop')) : REPEAT.NO // Get loop value from local storage
        handleLoop(localLoop) // Handle loop by local value

        const localShuffle = localStorage.getItem('shuffle') && !isNaN(Number(localStorage.getItem('shuffle'))) ? !!Number(localStorage.getItem('shuffle')) : false // Get shuffle value from local storage
        handleShuffle(localShuffle) // Handle shuffle by local value

        const localCurrentTime = localStorage.getItem('currentTime') && !isNaN(parseInt(localStorage.getItem('currentTime'))) ? parseInt(localStorage.getItem('currentTime')) : 0 // Get current time of track from local storage
        handleSeek(localCurrentTime) // Seek current time by local value

        audioRef.current.addEventListener('loadedmetadata', handleMetaData)
        audioRef.current.addEventListener('volumechange', handleVolumeChange)
        audioRef.current.addEventListener('play', handlePlay)
        audioRef.current.addEventListener('pause', handlePause)
        window.addEventListener('dragstart', handleDragStart)
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            audioRef.current.removeEventListener('loadedmetadata', handleMetaData)
            audioRef.current.removeEventListener('volumechange', handleVolumeChange)
            audioRef.current.removeEventListener('play', handlePlay)
            audioRef.current.removeEventListener('pause', handlePause)
            window.removeEventListener('dragstart', handleDragStart)
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    useEffect(() => {
        const audio = audioRef.current // Set audio reference
        const track = queue[queueIndex] // Get track from queue

        if (!audio) return // If audio element reference is not set, return

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
                hls.loadSource(track) // Load track manifest
                hls.attachMedia(audio) // Attach media to the audio
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    audio.currentTime = 0 // Start audio from 0
                })
                hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                    setDuration(audio.duration) // Update track duration state when media is attached
                })
                hlsRef.current = hls // Update HLS instance reference to the hls instance
            } else {
                audio.currentTime = currentTime // Update track's current time by state value
                setDuration(audio.duration)
            }
        } else if (audio.canPlayType('application/vnd.apple.mpegurl') && audio.src !== track) { // Otherwise, if browser supports mpeg files and audio element's source is not equals to track manifest URL
            audio.src = track // Set audio element's source to the track manifest URL
            audio.currentTime = 0 // Start audio from 0
        }

        if (isPlaying) audio.play() // If is playing state is true, play audio
        else audio.pause() // Else, pause audio
    }, [isPlayingRef.current])

    useEffect(() => {
        localStorage.setItem('loop', loop.toString()) // Update local storage value of loop mode state when it changes
    }, [loop])

    useEffect(() => {
        localStorage.setItem('shuffle', Number(shuffle).toString()) // Update local storage value of shuffle mode state when it changes
    }, [shuffle])

    useEffect(() => {
        if (Math.round(currentTime) % 5 === 0) localStorage.setItem('currentTime', currentTime.toString()) // Update local storage value of current time when divided by 5 and when it changes
    }, [currentTime])

    useEffect(() => {
        if (!queue[queueIndex]) setQueueIndex(queueIndex - 1) // Rewind if there is no track at that index
    }, [queueIndex])

    const handlePlayPause = state => {
        if (!durationRef.current) return
        if (typeof state !== 'boolean') setIsPlaying(!isPlaying) // Toggle play/pause if state value type is not set
        else setIsPlaying(state) // Otherwise, set is playing value to state
    }

    const handleTimeUpdate = () => setCurrentTime(audioRef.current.currentTime) // Update current time state to audio's current time

    const handleEnded = () => {
        handleSeek(0) // Seek current time to 0

        if (loop !== REPEAT.NO) { // If loop is on
            setQueueIndex(queueIndex + 1) // Switch to the next track
            handlePlayPause(true) // Play the track
        }
    }

    const handleSeek = time => {
        if (!durationRef.current) return

        setCurrentTime(time) // Update current time state by time
        audioRef.current.currentTime = time // Set audio element's current time to time
        localStorage.setItem('currentTime', time.toString()) // Set current time value on local storage
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
        <>
            <SkeletonTheme baseColor="rgba(0,0,0,.2)" highlightColor="rgba(50,50,50,.5)">
                <Wrapper load={load}>
                    <AudioContext.Provider value={{handlePlayPause, isPlaying, handleSeek, currentTime, durationRef, volume, handleVolumeUpdate, loop, handleLoop, shuffle, handleShuffle}}>
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
                                <audio ref={audioRef} controls onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} style={{display: 'none'}}></audio>
                            </TrackPanelContext.Provider>
                        </ScrollbarContext.Provider>
                    </AudioContext.Provider>
                </Wrapper>
            </SkeletonTheme>
        </>
    )
}
