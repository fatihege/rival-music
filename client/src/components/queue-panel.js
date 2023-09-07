import axios from 'axios'
import {useContext, useEffect, useRef, useState} from 'react'
import Skeleton from 'react-loading-skeleton'
import {QueueContext} from '@/contexts/queue'
import Image from '@/components/image'
import formatTime from '@/utils/format-time'
import {AlbumDefault, CloseIcon, PlayIcon} from '@/icons'
import styles from '@/styles/queue-panel.module.sass'

export default function QueuePanel() {
    const {
        showQueuePanel,
        setShowQueuePanel,
        queue,
        setQueue,
        queueIndex,
        setQueueIndex,
        track,
        dontChangeRef,
    } = useContext(QueueContext) // Get required functions and states from QueueContext
    const [queueData, setQueueData] = useState([]) // Queue data
    const [clicked, _setClicked] = useState(null) // Clicked state
    const [dragItem, _setDragItem] = useState(null) // Drag item state
    const [dragIndex, _setDragIndex] = useState(null) // Drag index state
    const [animatedDragItem, _setAnimatedDragItem] = useState(null) // Animated drag item state
    const clickedRef = useRef(clicked) // Clicked reference
    const dragItemRef = useRef(dragItem) // Drag item reference
    const dragIndexRef = useRef(dragIndex) // Drag index reference
    const dragPreviewRef = useRef() // Drag preview reference
    const animatedDragItemRef = useRef(animatedDragItem) // Animated drag item reference

    const setClicked = value => {
        clickedRef.current = value
        _setClicked(value)
    }

    const setDragItem = value => {
        dragItemRef.current = value
        _setDragItem(value)
    }

    const setDragIndex = value => {
        dragIndexRef.current = value
        _setDragIndex(value)
    }

    const setAnimatedDragItem = value => {
        animatedDragItemRef.current = value
        _setAnimatedDragItem(value)
    }

    useEffect(() => {
        if (!showQueuePanel) return // If queue panel is not visible, return

        const filteredQueue = queue?.filter((t, i) => t?.id !== track?._id && i > queueIndex) // Filter queue
        if (!filteredQueue?.length) {
            setQueueData([]) // If filtered queue is empty, set queue data to empty array
            return
        }

        getQueueData(filteredQueue) // Get queue data
    }, [queue, queueIndex, showQueuePanel, track])

    useEffect(() => {
        const mouseMove = e => {
            if (!dragItemRef.current) return // If drag item is not exist, return
            dragPreviewRef.current.style.top = `${e.clientY}px` // Set drag preview top position
            dragPreviewRef.current.style.left = `${e.clientX}px` // Set drag preview left position
        }

        const mouseUp = () => {
            setClicked(null)
            setDragItem(null)
        }

        document.addEventListener('mousemove', mouseMove)
        document.addEventListener('mouseup', mouseUp)

        return () => {
            document.removeEventListener('mousemove', mouseMove)
            document.removeEventListener('mouseup', mouseUp)
        }
    }, [])

    const getQueueData = queue => {
        axios.post(`${process.env.API_URL}/track/queue`, {
            queue: queue?.map(track => track?.id || track?._id),
        }).then(res => { // Get track info from the queue
            if (res.data?.status === 'OK' && res.data?.queue) setQueueData(res.data.queue) // Set track data to the queue
        }).catch(e => console.error(e))
    }

    const clearQueue = () => {
        setQueue([])
        setQueueData([])
        localStorage.removeItem('queue')
        localStorage.removeItem('queueIndex')
    }

    const dragStart = track => {
        if (clickedRef.current && clickedRef.current?.id === track?.id && !dragItemRef.current) { // If clicked reference is exist and clicked reference's ID is equal to track's ID and drag item is not exist
            setDragItem(track) // Set drag item to track
            setClicked(null) // Reset clicked reference
        }
    }

    const mouseLeave = track => {
        if (!dragItemRef.current) return // If drag item is not exist, return
        if (dragIndexRef.current === queueData.findIndex(t => t?.id === track?.id)) setDragIndex(null) // If drag index is equal to target element's index, set drag index to null
    }

    const dragEnd = track => {
        if (!dragItemRef.current) return // If drag item is not exist, return
        const index = queue.findIndex(t => t?.id === dragItemRef.current?.id) // Get index of drag item
        if (index === -1) return // If index is -1, return

        const newQueue = [...queue.slice(0, index), ...queue.slice(index + 1)] // Remove drag item from queue
        const newIndex = queue.findIndex(t => t?.id === track?.id) // Get index of drop item

        newQueue.splice(newIndex, 0, {
            id: dragItemRef.current?.id,
            audio: dragItemRef.current?.audio,
        }) // Add drag item to new queue
        dontChangeRef.current = true // Set dontChangeRef to true
        setQueue(newQueue) // Set queue to new queue
        setAnimatedDragItem(dragItemRef.current) // Set animated drag item to drag item
        setDragItem(null) // Reset drag item
        setTimeout(() => {
            setAnimatedDragItem(null) // Reset animated drag item
        }, 250)
    }

    const handlePlay = track => {
        let index = null
        queue.forEach((t, i) => {
            if (t?.id === track?.id) index = i
        })
        if (typeof index === 'number') setQueueIndex(index) // If index is exist, set queue index to that index
    }

    const handleRemove = (track) => {
        const newQueue = [...queue]
        newQueue.splice(newQueue.findIndex(t => t?.id === track?.id || t?._id === track?.id), 1)
        dontChangeRef.current = true // Set dontChangeRef to true
        setQueue(newQueue)
        setQueueData(queueData.filter(t => t?.id !== track?.id))
    }

    return (
        <>
            <div className={`${styles.dragPreview} ${dragItem ? styles.show : ''}`} ref={dragPreviewRef}>
                {dragItem ? (
                    <Image src={dragItem?.album?.cover} alt={dragItem?.title} width={40} height={40}
                           format={'webp'} alternative={<AlbumDefault/>}/>
                ) : ''}
            </div>
            <div className={`${styles.panel} ${showQueuePanel ? styles.active : ''}`}>
                <div className={styles.wrapper}>
                    <div className={styles.header}>
                        <div className={styles.leftColumn}>
                            <h2 className={styles.title}>
                                Next up
                            </h2>
                            {queueData.length ? (
                                <button className={styles.clear} onClick={clearQueue}>
                                    Clear
                                </button>
                            ) : ''}
                        </div>
                        <button className={styles.close} onClick={() => setShowQueuePanel(false)}>
                            <CloseIcon strokeRate={1.5}/>
                        </button>
                    </div>
                    {!queueData.length ? '' : (
                        <div className={styles.queue}>
                            {queueData.map((track, index) => (
                                <div key={index}>
                                    <div className={`${styles.track} ${dragItem && dragItem.id === track?.id ? styles.dragging : ''} ${animatedDragItem && animatedDragItem.id === track?.id ? styles.animated : ''}`}
                                         onMouseDown={() => setClicked(track)} onMouseMove={() => dragStart(track)} onMouseLeave={() => mouseLeave(track)} onMouseUp={() => dragEnd(track)}>
                                        <div className={styles.trackInfo}>
                                            <div className={styles.cover}>
                                                <Image src={track?.album?.cover} alt={track?.title} width={40} height={40} format={'webp'}
                                                       alternative={<AlbumDefault/>} loading={<Skeleton height={40} style={{top: '-3px'}}/>}/>
                                                <div className={styles.overlay}>
                                                    <button className={styles.play} onClick={() => handlePlay(track)}>
                                                        <PlayIcon rounded={true}/>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={styles.trackText}>
                                                <h3 className={styles.title}>{track?.title}</h3>
                                                <p className={styles.artist}>{track?.album?.artist?.name}</p>
                                            </div>
                                        </div>
                                        <div className={styles.trackDuration}>
                                            <p>{formatTime(track?.duration)}</p>
                                            <button className={styles.remove} onClick={() => handleRemove(track)}>
                                                <CloseIcon strokeRate={1.25}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}