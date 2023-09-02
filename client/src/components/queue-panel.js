import axios from 'axios'
import {useContext, useEffect, useRef, useState} from 'react'
import {QueueContext} from '@/contexts/queue'
import Image from '@/components/image'
import {AlbumDefault, CloseIcon, PlayIcon} from '@/icons'
import styles from '@/styles/queue-panel.module.sass'
import Skeleton from 'react-loading-skeleton'
import formatTime from '@/utils/format-time'

export default function QueuePanel() {
    const {showQueuePanel,
        setShowQueuePanel,
        queue,
        setQueue,
        queueIndex,
        setQueueIndex,
        track,
        dontChangeRef,
    } = useContext(QueueContext) // Get required functions and states from QueueContext
    const [queueData, setQueueData] = useState([]) // Queue data
    const [clicked, setClicked] = useState(null) // Clicked state
    const [dragItem, setDragItem] = useState(null) // Drag item state
    const [dragIndex, setDragIndex] = useState(null) // Drag index state
    const [dragPreview, setDragPreview] = useState(null) // Drag preview state
    const [animatedDragItem, setAnimatedDragItem] = useState(null) // Animated drag item state
    const clickedRef = useRef(null) // Clicked reference
    const dragItemRef = useRef(null) // Drag item reference
    const dragIndexRef = useRef(null) // Drag index reference
    const dragPreviewRef = useRef(null) // Drag preview reference
    const animatedDragItemRef = useRef(null) // Animated drag item reference

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
            clickedRef.current = null
            dragItemRef.current = null
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
    }

    const dragStart = track => {
        if (clickedRef.current && clickedRef.current?.id === track?.id && !dragItemRef.current) { // If clicked reference is exist and clicked reference's ID is equal to track's ID and drag item is not exist
            console.log('dragStart')
            dragItemRef.current = track // Set drag item to track
            clickedRef.current = null // Reset clicked reference
        }
    }

    const mouseLeave = track => {
        if (!dragItemRef.current) return // If drag item is not exist, return
        if (dragIndexRef.current === queueData.findIndex(t => t?.id === track?.id)) dragIndexRef.current = null // If drag index is equal to target element's index, set drag index to null
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
        animatedDragItemRef.current = dragItemRef.current // Set animated drag item to drag item
        dragItemRef.current = null // Reset drag item
        setTimeout(() => {
            animatedDragItemRef.current = null // Reset animated drag item
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
        newQueue.splice(newQueue.findIndex(t => t?.id === track?.id), 1)
        dontChangeRef.current = true // Set dontChangeRef to true
        setQueue(newQueue)
        setQueueData(queueData.filter(t => t?.id !== track?.id))
    }

    return (
        <>
            <div className={`${styles.dragPreview} ${dragItemRef.current ? styles.show : ''}`} ref={dragPreviewRef}>
                {dragItemRef.current ? (
                    <Image src={dragItemRef.current?.album?.cover} alt={dragItemRef.current?.title} width={40} height={40}
                           format={'webp'} alternative={<AlbumDefault/>}/>
                ) : ''}
            </div>
            <div className={`${styles.panel} ${showQueuePanel ? styles.active : ''} ${dragItemRef.current ? styles.dragging : ''}`}>
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
                            {queueData.map((track) => (
                                <div key={track?.id}>
                                    <div className={`${styles.track} ${dragItemRef.current && dragItemRef.current.id === track?.id ? styles.dragging : ''} ${animatedDragItemRef.current && animatedDragItemRef.current.id === track?.id ? styles.animated : ''}`}
                                         onMouseDown={() => clickedRef.current = track} onMouseMove={() => dragStart(track)} onMouseLeave={() => mouseLeave(track)} onMouseUp={() => dragEnd(track)}>
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