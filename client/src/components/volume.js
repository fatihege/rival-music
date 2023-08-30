import {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {AudioContext} from '@/contexts/audio'
import {TooltipHandler} from '@/components/tooltip'
import {VolumeHighIcon, VolumeLowIcon, VolumeMidIcon, VolumeMuteIcon} from '@/icons'
import styles from '@/styles/volume.module.sass'

export default function Volume() {
    const {volume, handleVolumeUpdate} = useContext(AudioContext) // Audio controls context
    const [isDragging, setIsDragging] = useState(false) // Is progress bar dragging
    /**
     * @type {React.MutableRefObject<HTMLDivElement>}
     */
    const trackRef = useRef() // Progress bar ref
    const [level, _setLevel] = useState(volume) // Volume level
    const levelRef = useRef(level) // Volume level ref

    const setLevel = value => { // Set volume level
        _setLevel(value)
        levelRef.current = value
    }

    useEffect(() => {
        if (isDragging) return // If this bar is dragging, return
        setLevel(volume * 100) // Otherwise, update volume level
    }, [volume])

    const updateVolumeLevel = (e, save) => {
        const absValue = e.clientX - trackRef.current.getBoundingClientRect().left // Get absolute value
        const percentage = Math.round(Math.max(Math.min(absValue / trackRef.current.clientWidth * 100, 100), 0)) // Get percentage
        setLevel(percentage) // Set volume level
        handleVolumeUpdate(percentage) // Update volume
        if (save && percentage !== 0) localStorage.setItem('volumeLevel', percentage.toString()) // If save is true and volume level is not 0, save to the local storage
    }

    const handleProgressDown = useCallback(e => {
        setIsDragging(true) // Set dragging to true
        updateVolumeLevel(e, true) // Update volume level and save to the local storage
    }, [])

    const handleProgressUp = useCallback(e => {
        if (!isDragging) return
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false) // Set dragging to false
        if (levelRef.current !== 0) localStorage.setItem('volumeLevel', levelRef.current.toString()) // If volume level not 0, save to the local storage when mouse is up
    }, [isDragging])

    const handleProgressMove = useCallback(e => {
        if (!trackRef.current || !isDragging) return // If progress bar ref or dragging is not set, return
        e.preventDefault()
        e.stopPropagation()
        updateVolumeLevel(e) // Update volume level
    }, [isDragging, trackRef.current])

    const handleKeyDown = useCallback(e => {
        if (e.code === 'ArrowUp' && e.ctrlKey) { // If arrow up or arrow right is pressed
            e.preventDefault()
            e.stopPropagation()
            if (levelRef.current < 100) { // If volume level is less than 100
                const newLevel = Math.min(100, levelRef.current + 1) // Increase volume level by 1 and set to 100 if it is more than 100
                setLevel(newLevel) // Set volume level
                handleVolumeUpdate(newLevel) // Handle volume level
                localStorage.setItem('volumeLevel', newLevel.toString()) // Save to the local storage
            }
        } else if (e.code === 'ArrowDown' && e.ctrlKey) { // If arrow down or arrow left is pressed
            e.preventDefault()
            e.stopPropagation()
            if (levelRef.current > 0) { // If volume level is more than 0
                const newLevel = Math.max(0, levelRef.current - 1) // Decrease volume level by 1 and set to 0 if it is less than 0
                setLevel(newLevel) // Set volume level
                handleVolumeUpdate(newLevel) // Handle volume level
                localStorage.setItem('volumeLevel', newLevel.toString()) // Save to the local storage
            }
        }
    })

    const toggleMute = () => {
        if (levelRef.current !== 0) { // If volume level is not 0
            setLevel(0) // Set volume level to 0
            handleVolumeUpdate(0) // Handle volume by 0
        }
        else updateVolumeByLocal() // Otherwise, get volume level from local storage
    }

    const updateVolumeByLocal = () => {
        const localLevel = !isNaN(parseInt(localStorage.getItem('volumeLevel'))) ? parseInt(localStorage.getItem('volumeLevel')) : 50 // Get volume level from local storage. If it is not set, set to 50%
        setLevel(localLevel) // Update volume level
        handleVolumeUpdate(localLevel) // Handle volume level by local value
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('mousemove', handleProgressMove)
        document.addEventListener('mouseup', handleProgressUp)
        document.addEventListener('mouseleave', handleProgressUp)

        return () => { // Remove event listeners
            document.removeEventListener('keydown', handleKeyDown)
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
                <TooltipHandler title={levelRef.current ? 'Mute' : 'Unmute'}>
                    <button className={styles.iconButton} onClick={() => toggleMute()}>
                        {
                            level >= 60 ? <VolumeHighIcon strokeRate={1.2}/> :
                            level >= 30 ? <VolumeMidIcon strokeRate={1.2}/> :
                            level > 0 ? <VolumeLowIcon strokeRate={1.2}/> :
                            level === 0 ? <VolumeMuteIcon strokeRate={1.2}/> : <VolumeHighIcon strokeRate={1.2}/>
                        }
                    </button>
                </TooltipHandler>
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