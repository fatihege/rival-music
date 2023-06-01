import {useCallback, useEffect, useRef, useState} from 'react'
import formatTime from '@/utils/format-time'
import styles from '@/styles/player.module.sass'

export default function Player({duration = 0}) {
    const [isDragging, setIsDragging] = useState(false) // Is progress bar dragging
    const playerRef = useRef() // Progress bar ref
    const [width, _setWidth] = useState(0) // Progress bar width
    const widthRef = useRef(width) // Progress bar width ref

    const setWidth = value => { // Set progress bar width
        _setWidth(value)
        widthRef.current = value
    }

    const handleProgressDown = useCallback(e => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true) // Set dragging to true
    }, [])

    const handleProgressUp = useCallback(e => {
        e.preventDefault()
        e.stopPropagation()
        if (isDragging) setIsDragging(false) // Set dragging to false
    }, [isDragging])

    const handleProgressMove = useCallback(e => {
        if (!playerRef.current || !isDragging) return // If progress bar ref or dragging is not set, return

        const absValue = e.clientX - playerRef.current.getBoundingClientRect().left // Get absolute value
        const percentage = Math.max(Math.min(absValue / playerRef.current.clientWidth * 100, 100), 0) // Get percentage
        setWidth(percentage) // Set progress bar width
    }, [isDragging, playerRef.current])

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
        <div className={styles.timeline}>
            <div className={styles.timeText}>{formatTime(duration * (widthRef.current / 100))}</div>
            <div className={styles.playerWrapper} onMouseDown={handleProgressDown}>
                <div className={styles.player} ref={playerRef}>
                    <div className={`${styles.progress} ${isDragging ? styles.active : ''}`} style={{width: `${widthRef.current}%`}}>
                        <div className={styles.button}></div>
                    </div>
                </div>
            </div>
            <div className={styles.timeText}>{formatTime(duration)}</div>
        </div>
    )
}