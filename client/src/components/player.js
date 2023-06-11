import {useCallback, useContext, useEffect, useRef, useState} from 'react'
import {AudioContext} from '@/pages/_app'
import formatTime from '@/utils/format-time'
import styles from '@/styles/player.module.sass'

export default function Player({type = 'bar'}) {
    const {handleSeek, currentTime, duration} = useContext(AudioContext) // Audio context controls
    const [isDragging, setIsDragging] = useState(false) // Is progress bar dragging
    const trackRef = useRef() // Progress bar ref
    const [width, _setWidth] = useState(0) // Progress bar width
    const widthRef = useRef(width) // Progress bar width ref

    const setWidth = value => { // Set progress bar width
        _setWidth(value)
        widthRef.current = value
    }

    const updateDuration = e => {
        if (!duration) return
        const absValue = e.clientX - trackRef.current.getBoundingClientRect().left // Get absolute value
        const percentage = Math.max(Math.min(absValue / trackRef.current.clientWidth * 100, 100), 0) // Get percentage
        setWidth(percentage) // Set progress bar width
    }

    const handleProgressDown = useCallback(e => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true) // Set dragging to true
        updateDuration(e)
    }, [])

    const handleProgressUp = useCallback(e => {
        e.preventDefault()
        e.stopPropagation()
        if (isDragging) {
            const currentTime = duration * (widthRef.current / 100) // Calculate current time as seconds
            handleSeek(currentTime) // Seek the current time
            setIsDragging(false) // Set dragging to false
        }
    }, [isDragging])

    const handleProgressMove = useCallback(e => {
        if (!trackRef.current || !isDragging) return // If progress bar ref or dragging is not set, return
        updateDuration(e)
    }, [isDragging, trackRef.current])

    useEffect(() => {
        if (duration && !isDragging) { // If duration is set and the player thumb is not dragging
            const percentage = Math.max(Math.min(currentTime / duration * 100, 100), 0) // Calculate percentage
            setWidth(percentage) // Update player bar width
        }
    }, [currentTime, duration])

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
                <div className={styles.timeText}>{formatTime(currentTime || null)}</div>
                <div className={styles.playerWrapper} onMouseDown={handleProgressDown}>
                    <div className={styles.player} ref={trackRef}>
                        <div className={`${styles.progress} ${isDragging ? styles.active : ''}`} style={{width: `${widthRef.current}%`}}>
                        </div>
                    </div>
                    <div className={styles.button} style={{left: `${widthRef.current}%`}}></div>
                </div>
                <div className={styles.timeText}>{formatTime(duration || null)}</div>
            </div>
        ) : (
            <div className={`${styles.timeline} ${styles.wide}`}>
                <div className={styles.playerWrapper} onMouseDown={handleProgressDown}>
                    <div className={styles.player} ref={trackRef}>
                        <div className={`${styles.progress} ${isDragging ? styles.active : ''}`} style={{width: `${widthRef.current}%`}}>
                        </div>
                    </div>
                    <div className={styles.button} style={{left: `${widthRef.current}%`}}></div>
                </div>
                <div className={styles.timeLabels}>
                    <div className={styles.timeText}>{formatTime(currentTime || null)}</div>
                    <div className={styles.timeText}>{formatTime(duration || null)}</div>
                </div>
            </div>
        )
    )
}