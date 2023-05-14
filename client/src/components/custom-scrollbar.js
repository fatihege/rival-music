import {useCallback, useEffect, useRef, useState} from 'react'
import styles from '@/styles/scrollbars.module.sass'

const MIN_THUMB_HEIGHT = 16 // Minimum thumb height

export default function CustomScrollbar({children, className = ''}) {
    const contentRef = useRef() // Content ref
    const trackRef = useRef() // Track ref
    const thumbRef = useRef() // Thumb ref
    const observer = useRef() // Observer ref
    const [thumbHeight, setThumbHeight] = useState(MIN_THUMB_HEIGHT) // Thumb height
    const [scrollStartPosition, setScrollStartPosition] = useState(null) // Scroll start position
    const [initialScrollTop, setInitialScrollTop] = useState(0) // Initial scroll top position
    const [isDragging, setIsDragging] = useState(false) // Is dragging
    const [hide, setHide] = useState(false) // Is scrollbar hidden

    const handleResize = (content, trackHeight) => { // Handle thumb resize
        const {clientHeight, scrollHeight} = content // Get content height
        setThumbHeight(Math.max((clientHeight / scrollHeight) * trackHeight, MIN_THUMB_HEIGHT)) // Set thumb height based on content height

        if (thumbHeight >= scrollHeight && !hide) setHide(true) // Hide scrollbar if content height is less than or equals to thumb height
        else if (hide) setHide(false) // Show scrollbar if content height is greater than thumb height
    }

    const handleThumbPosition = useCallback(() => {
        if (!contentRef.current || !trackRef.current || !thumbRef.current) return // Return if any of the refs are not set

        const {scrollTop: contentTop, scrollHeight: contentHeight} = contentRef.current // Get content top and height
        const {clientHeight: trackHeight} = trackRef.current // Get track height
        let newTop = (+contentTop / +contentHeight) * trackHeight // Calculate new top position
        newTop = Math.min(newTop, trackHeight - thumbHeight) // Make sure new top position is not greater than track height - thumb height

        thumbRef.current.style.top = `${newTop}px` // Set new top position
    }, [])

    const handleTrackClick = useCallback(e => {
        e.preventDefault()
        e.stopPropagation()

        const {current: trackCurrent} = trackRef // Get track ref
        const {current: contentCurrent} = contentRef // Get content ref

        if (trackCurrent && contentCurrent) { // Make sure both refs are set
            const {clientY, target} = e // Get client y and target
            const rect = target.getBoundingClientRect() // Get target bounding rect
            const trackTop = rect.top // Get track top
            const thumbOffset = -(thumbHeight / 2) // Get thumb offset
            const clickRatio = (clientY - trackTop + thumbOffset) / trackCurrent.clientHeight // Calculate click ratio
            const scrollAmount = Math.floor(clickRatio * contentCurrent.scrollHeight) // Calculate scroll amount

            contentCurrent.scrollTo({ // Scroll to scroll amount
                top: scrollAmount,
                behavior: 'smooth',
            })
        }
    })

    const handleThumbMouseDown = useCallback(e => {
        e.preventDefault()
        e.stopPropagation()

        setScrollStartPosition(e.clientY) // Set scroll start position
        if (contentRef.current) setInitialScrollTop(contentRef.current.scrollTop) // Set initial scroll top position
        setIsDragging(true) // Thumb is being dragged
    }, [])

    const handleThumbMouseUp = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()

        if (isDragging) setIsDragging(false) // Thumb is not being dragged
    }, [isDragging])

    const handleThumbMouseMove = useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()

        if (isDragging) { // If thumb is being dragged
            const {scrollHeight: contentScrollHeight, offsetHeight: contentOffsetHeight} = contentRef.current // Get content scroll height and offset height
            const deltaY = (e.clientY - scrollStartPosition) * (contentOffsetHeight / thumbHeight) // Calculate delta y
            const newScrollTop = Math.min(initialScrollTop + deltaY, contentScrollHeight - contentOffsetHeight) // Calculate new scroll top position

            contentRef.current.scrollTop = newScrollTop // Set new scroll top position
        }
    }, [isDragging, scrollStartPosition, thumbHeight])

    useEffect(() => {
        document.addEventListener('mousemove', handleThumbMouseMove)
        document.addEventListener('mouseup', handleThumbMouseUp)
        document.addEventListener('mouseleave', handleThumbMouseUp)

        return () => { // Cleanup
            document.removeEventListener('mousemove', handleThumbMouseMove)
            document.removeEventListener('mouseup', handleThumbMouseUp)
            document.removeEventListener('mouseleave', handleThumbMouseUp)
        }
    }, [handleThumbMouseMove, handleThumbMouseUp])

    useEffect(() => {
        if (contentRef.current && trackRef.current) { // Make sure both refs are set
            const content = contentRef.current // Get content ref
            const {clientHeight: trackHeight} = trackRef.current // Get track height

            observer.current = new ResizeObserver(() => { // Create new resize observer
                handleResize(content, trackHeight)
            })
            observer.current.observe(content) // Observe content
            content.addEventListener('scroll', handleThumbPosition) // Add scroll event listener

            return () => { // Cleanup
                observer.current?.unobserve(content) // Unobserve content
                content.removeEventListener('scroll', handleThumbPosition) // Remove scroll event listener
            }
        }
    }, [thumbHeight, children])

    useEffect(() => {
        window.addEventListener('resize', () => {
            handleResize(contentRef.current, trackRef.current.clientHeight) // Handle thumb resize
            handleThumbPosition() // Handle thumb position
        })
    }, [])

    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.content} ref={contentRef}>
                {children}
            </div>
            <div className={styles.scrollbar}>
                <div className={styles.scrollbarWrapper} ref={trackRef} onMouseDown={handleTrackClick}>
                    {!hide ? <div className={styles.thumb} ref={thumbRef} style={{height: `${thumbHeight}px`}} onMouseDown={handleThumbMouseDown}></div> : ''}
                </div>
            </div>
        </div>
    )
}