import {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {AudioContext} from '@/pages/_app'
import styles from '@/styles/volume.module.sass'
import {VolumeHighIcon, VolumeLowIcon, VolumeMidIcon, VolumeMuteIcon} from '@/icons'

export default function Volume() {
    const {volume, handleVolumeUpdate} = useContext(AudioContext) // Audio controls context
    const [isDragging, setIsDragging] = useState(false) // Is progress bar dragging
    const trackRef = useRef() // Progress bar ref
    const [level, _setLevel] = useState(volume) // Volume level
    const levelRef = useRef(level) // Volume level ref

    const setLevel = value => { // Set volume level
        _setLevel(value)
        levelRef.current = value
    }

    const updateVolumeLevel = (e, save) => {
        const absValue = e.clientX - trackRef.current.getBoundingClientRect().left // Get absolute value
        const percentage = Math.round(Math.max(Math.min(absValue / trackRef.current.clientWidth * 100, 100), 0)) // Get percentage
        setLevel(percentage) // Set volume level
        handleVolumeUpdate(percentage) // Update volume
        if (save && percentage !== 0) localStorage.setItem('volumeLevel', percentage) // If save is true and volume level is not 0, save to the local storage
    }

    const handleProgressDown = useCallback(e => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true) // Set dragging to true
        updateVolumeLevel(e, true) // Update volume level and save to the local storage
    }, [])

    const handleProgressUp = useCallback(e => {
        e.preventDefault()
        e.stopPropagation()
        if (isDragging) setIsDragging(false) // Set dragging to false
        if (levelRef.current !== 0) localStorage.setItem('volumeLevel', levelRef.current) // If volume level not 0, save to the local storage when mouse is up
    }, [isDragging])

    const handleProgressMove = useCallback(e => {
        if (!trackRef.current || !isDragging) return // If progress bar ref or dragging is not set, return
        updateVolumeLevel(e) // Update volume level
    }, [isDragging, trackRef.current])

    const toggleMute = () => {
        if (levelRef.current !== 0) { // If volume level is not 0
            setLevel(0) // Set volume level to 0
            handleVolumeUpdate(0) // Handle volume by 0
        }
        else updateVolumeByLocal() // Otherwise, get volume level from local storage
    }

    const updateVolumeByLocal = () => {
        const localLevel = !isNaN(parseInt(localStorage.getItem('volumeLevel'))) ? parseInt(localStorage.getItem('volumeLevel')) : 100 // Get volume level from local storage. If it is not set, set to 100%
        setLevel(localLevel) // Update volume level
        handleVolumeUpdate(localLevel) // Handle volume level by local value
    }

    useEffect(() => {
        document.addEventListener('mousemove', handleProgressMove)
        document.addEventListener('mouseup', handleProgressUp)
        document.addEventListener('mouseleave', handleProgressUp)

        return () => { // Remove event listeners
            document.removeEventListener('mousemove', handleProgressMove)
            document.removeEventListener('mouseup', handleProgressUp)
            document.removeEventListener('mouseleave', handleProgressUp)
        }
    }, [handleProgressMove, handleProgressUp])

    useEffect(() => {
        updateVolumeByLocal() // Get volume level from local storage when the component is mounted
    }, [])

    return (
        <div className={styles.volume}>
            <div className={styles.icon}>
                <button className={styles.iconButton} onClick={() => toggleMute()}>
                    {
                        level >= 60 ? <VolumeHighIcon/> :
                        level >= 30 ? <VolumeMidIcon/> :
                        level > 0 ? <VolumeLowIcon/> :
                        level === 0 ? <VolumeMuteIcon/> : <VolumeHighIcon/>
                    }
                </button>
            </div>
            <div className={styles.trackWrapper} onMouseDown={handleProgressDown}>
                <div className={styles.track} ref={trackRef}>
                    <div className={styles.progress} style={{width: `${levelRef.current}%`}}>
                        <div className={styles.button}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}