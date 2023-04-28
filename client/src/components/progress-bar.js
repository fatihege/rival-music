import {useContext, useEffect, useRef, useState} from 'react'
import {ProgressBarContext} from '@/pages/_app'
import formatTime from '@/utils/format-time'
import styles from '@/styles/progress-bar.module.sass'

export default function ProgressBar({duration = 0}) {
    const [isProgressBarChanging, setIsProgressBarChanging] = useContext(ProgressBarContext) // Progress bar changing state
    const progressBarRef = useRef() // Progress bar ref
    const [width, _setWidth] = useState(0) // Progress bar width
    const widthRef = useRef(width) // Progress bar width ref

    const setWidth = value => { // Set progress bar width
        _setWidth(value)
        widthRef.current = value
    }

    useEffect(() => {
        if (!progressBarRef.current) return // If progress bar ref is not ready, return

        progressBarRef.current.addEventListener('mousedown', () => { // When mouse down on progress bar
            setIsProgressBarChanging({ // Set progress bar changing state
                active: true,
                setWidth: e => { // Set progress bar width
                    const absValue = e.clientX - progressBarRef.current.getBoundingClientRect().left // Get absolute value
                    const percentage = Math.max(Math.min(absValue / progressBarRef.current.clientWidth * 100, 100), 0) // Get percentage
                    setWidth(percentage) // Set progress bar width
                },
            })
        })
    }, [progressBarRef])

    return (
        <div className={styles.timeline}>
            <div className={styles.timeText}>{formatTime(duration * (widthRef.current / 100))}</div>
            <div className={styles.progressBarWrapper} ref={progressBarRef}>
                <div className={styles.progressBar}>
                    <div className={`${styles.progress} ${isProgressBarChanging.active ? styles.active : ''}`} style={{width: `${widthRef.current}%`}}>
                        <div className={styles.button}></div>
                    </div>
                </div>
            </div>
            <div className={styles.timeText}>{formatTime(duration)}</div>
        </div>
    )
}