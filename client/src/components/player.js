import {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {AudioContext} from '@/contexts/audio'
import formatTime from '@/utils/format-time'
import styles from '@/styles/player.module.sass'

/**
 * @param {'bar' | 'full'} type
 * @returns {JSX.Element}
 * @constructor
 */
export default function Player({type = 'bar'}) {
    const {handleSeek, currentTime, durationRef} = useContext(AudioContext) // Audio context controls
    const [isDragging, setIsDragging] = useState(false) // Is progress bar dragging
    const [width, _setWidth] = useState(0) // Progress bar width
    const [dragTime, _setDragTime] = useState(null) // Temporary drag time state
    /**
     * @type {React.MutableRefObject<HTMLDivElement>}
     */
    const trackRef = useRef() // Progress bar reference
    const widthRef = useRef(width) // Progress bar width reference
    const dragTimeRef = useRef(dragTime) // Temporary drag time reference

    const setWidth = value => { // Set progress bar width
        _setWidth(value)
        widthRef.current = value
    }

    const setDragTime = value => { // Set temporary drag time
        _setDragTime(value)
        dragTimeRef.current = value
    }

    const updateDuration = e => {
        const absValue = e.clientX - trackRef.current.getBoundingClientRect().left // Get absolute value
        const percentage = Math.max(Math.min(absValue / trackRef.current.clientWidth * 100, 100), 0) // Get percentage
        setWidth(percentage) // Set progress bar width
        const currentTime = durationRef.current * (widthRef.current / 100) // Calculate current time as seconds
        setDragTime(currentTime)
    }

    const handleProgressDown = useCallback(e => {
        if (!durationRef.current) return
        setIsDragging(true) // Set dragging to true
        updateDuration(e)
    }, [])

    const handleProgressUp = useCallback(e => {
        if (!isDragging) return

        e.preventDefault()
        e.stopPropagation()

        const currentTime = durationRef.current * (widthRef.current / 100) // Calculate current time as seconds
        handleSeek(currentTime) // Seek the current time
        setIsDragging(false) // Set dragging to false
        setDragTime(null)
    }, [isDragging])

    const handleProgressMove = useCallback(e => {
        if (!trackRef.current || !isDragging) return // If progress bar ref or dragging is not set, return
        e.preventDefault()
        e.stopPropagation()
        updateDuration(e)
    }, [isDragging, trackRef.current])

    useEffect(() => {
        if (durationRef.current && !isDragging) { // If durationRef.current is set and the player thumb is not dragging
            const percentage = Math.max(Math.min(currentTime / durationRef.current * 100, 100), 0) // Calculate percentage
            setWidth(percentage) // Update player bar width
        }
    }, [currentTime, durationRef.current])

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

    return (
        type === 'bar' ? (
            <div className={styles.timeline}>
                <div className={styles.timeText}>{formatTime(dragTimeRef.current !== null ? dragTimeRef.current : (typeof currentTime !== 'number' || !durationRef.current ? null : currentTime))}</div>
                <div className={styles.playerWrapper} onMouseDown={handleProgressDown}>
                    <div className={styles.player} ref={trackRef}>
                        <div className={styles.progress} style={{width: `${widthRef.current}%`}}>
                        </div>
                    </div>
                    <div className={`${styles.button} ${isDragging ? styles.active : ''}`} style={{left: `${widthRef.current}%`}}></div>
                </div>
                <div className={styles.timeText}>{formatTime(durationRef.current || null)}</div>
            </div>
        ) : (
            <div className={`${styles.timeline} ${styles.wide}`}>
                <div className={styles.playerWrapper} onMouseDown={handleProgressDown}>
                    <div className={styles.player} ref={trackRef}>
                        <div className={styles.progress} style={{width: `${widthRef.current}%`}}>
                        </div>
                    </div>
                    <div className={`${styles.button} ${isDragging ? styles.active : ''}`} style={{left: `${widthRef.current}%`}}></div>
                </div>
                <div className={styles.timeLabels}>
                    <div className={styles.timeText}>{formatTime(dragTimeRef.current !== null ? dragTimeRef.current : (typeof currentTime !== 'number' || !durationRef.current ? null : currentTime))}</div>
                    <div className={styles.timeText}>{formatTime(durationRef.current || null)}</div>
                </div>
            </div>
        )
    )
}