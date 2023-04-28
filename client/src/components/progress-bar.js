import {useContext, useEffect, useRef, useState} from 'react'
import {ProgressBarContext} from '@/pages/_app'
import formatTime from '@/utils/format-time'
import styles from '@/styles/progress-bar.module.sass'

export default function ProgressBar({duration = 0}) {
    const [isProgressBarChanging, setIsProgressBarChanging] = useContext(ProgressBarContext)
    const progressBarRef = useRef()
    const [scaleX, _setScaleX] = useState(0)
    const scaleXRef = useRef(scaleX)

    const setScaleX = value => {
        _setScaleX(value)
        scaleXRef.current = value
    }

    useEffect(() => {
        if (!progressBarRef.current) return

        progressBarRef.current.addEventListener('mousedown', () => {
            setIsProgressBarChanging({
                active: true,
                setWidth: e => {
                    const absValue = e.clientX - progressBarRef.current.getBoundingClientRect().left
                    const percentage = Math.max(Math.min(absValue / progressBarRef.current.clientWidth * 100, 100), 0)
                    setScaleX(percentage)
                },
            })
        })
    }, [progressBarRef])

    return (
        <div className={styles.timeline}>
            <div className={styles.timeText}>{formatTime(duration * (scaleXRef.current / 100))}</div>
            <div className={styles.progressBarWrapper} ref={progressBarRef}>
                <div className={styles.progressBar}>
                    <div className={`${styles.progress} ${isProgressBarChanging.active ? styles.active : ''}`} style={{width: `${scaleXRef.current}%`}}>
                        <div className={styles.button}></div>
                    </div>
                </div>
            </div>
            <div className={styles.timeText}>{formatTime(duration)}</div>
        </div>
    )
}