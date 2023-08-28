import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import {QueueContext} from '@/contexts/queue'
import Link from '@/components/link'
import {TooltipHandler} from '@/components/tooltip'
import {AlbumDefault, NextIcon, OptionsIcon, PlayIcon, PrevIcon} from '@/icons'
import styles from '@/styles/slider.module.sass'

/**
 * @param {'artists' | 'albums' | 'tracks'} type
 * @param {string} title
 * @param {Array} items
 * @returns {JSX.Element}
 * @constructor
 */
export default function Slider({title, items = []}) {
    const {setQueue, setQueueIndex} = useContext(QueueContext) // Queue context
    const router = useRouter() // Router instance
    const isScrolling = useRef(false) // Is slider scrolling
    /**
     * @type {React.MutableRefObject<HTMLDivElement>}
     */
    const containerRef = useRef() // Slider container
    /**
     * @type {React.MutableRefObject<HTMLDivElement>}
     */
    const sliderRef = useRef() // Slider wrapper
    /**
     * @type {React.MutableRefObject<HTMLDivElement>}
     */
    const slidesRef = useRef() // Slides container
    /**
     * @type {React.MutableRefObject<HTMLButtonElement>}
     */
    const prevButtonRef = useRef() // Previous button
    /**
     * @type {React.MutableRefObject<HTMLButtonElement>}
     */
    const nextButtonRef = useRef() // Next button
    /**
     * @type {React.MutableRefObject<HTMLDivElement>}
     */
    const referenceSlideRef = useRef() // Reference slide
    /**
     * @type {React.MutableRefObject<HTMLDivElement>}
     */
    const fadingRef = useRef() // Fading overlay
    const [showAll, _setShowAll] = useState(false) // Show all state
    const showAllRef = useRef(showAll) // Show all state reference

    const setShowAll = value => { // Update show all state
        showAllRef.current = value
        _setShowAll(value)
    }

    const checkFading = () => {
        const {current: slider} = sliderRef // Get slider from reference
        const {scrollLeft} = slider // Get scroll left value from slider
        const scrollRight = slider.scrollWidth - scrollLeft - slider.clientWidth // Calculate scroll right

        if (scrollLeft > 0) fadingRef.current?.classList.add(styles.left) // If scroll left greater than 0, show left fading
        else fadingRef.current?.classList.remove(styles.left) // Otherwise, hide left fading

        if (scrollRight > 0) fadingRef.current?.classList.add(styles.right) // If scroll right greater than 0, show right fading
        else fadingRef.current?.classList.remove(styles.right) // Otherwise, hide right fading

        if (scrollLeft <= 0) prevButtonRef.current?.classList.add(styles.disabled) // If scroll left is 0, disable previous slide button
        else prevButtonRef.current?.classList.remove(styles.disabled) // Otherwise, enable previous slide button

        if (scrollRight <= 0) nextButtonRef.current?.classList.add(styles.disabled) // If scroll right is 0, disable next slide button
        else nextButtonRef.current?.classList.remove(styles.disabled) // Otherwise, enable next slide button
    }

    useEffect(() => {
        if (showAll) fadingRef.current?.classList.remove(styles.left, styles.right) // If show all is true, hide left and right fading
        else checkFading() // Else, check fading
    }, [showAll])

    useEffect(() => {
        checkFading() // Check scroll amounts when items are changed
    }, [items])

    useEffect(() => {
        if (!sliderRef.current || !slidesRef.current || !prevButtonRef.current || !nextButtonRef.current || !referenceSlideRef.current) return // Check if all elements exist

        const slider = sliderRef.current // Slider wrapper
        const slides = slidesRef.current // Slides container
        let isDown = false // Mouse is down
        let startX // Mouse start X position
        let scrollLeft // Scroll left position
        let walk // Mouse walk

        checkFading() // Initially check fading

        const handleScroll = (prev = false) => { // Scroll to previous or next slide
            const sliderRect = slider?.getBoundingClientRect() // Slider wrapper rectangle
            const referenceSlideRect = referenceSlideRef.current?.getBoundingClientRect() // Reference slide rectangle
            const referenceWidth = referenceSlideRect.width + 16 * 1.5 // Reference slide width + gap
            const scrollAmount = (prev ? -1 : 1) * (referenceSlideRect ? sliderRect.width / referenceWidth * referenceWidth : 400) // Calculate scroll amount
            const snapScroll = (slider.scrollLeft + scrollAmount) % referenceWidth // Calculate scroll amount to snap to next slide

            slider.style.scrollBehavior = 'smooth' // Enable smooth scroll
            slider.scrollLeft = Math.min(slider.scrollLeft + scrollAmount - snapScroll, slider.scrollWidth - slider.clientWidth) // Scroll to slide
        }

        const handleMouseDown = (e) => {
            e.stopPropagation() // Stop propagation
            slider.style.scrollBehavior = 'unset' // Disable smooth scroll
            isDown = true // Mouse is down
            startX = e.pageX - slides.offsetLeft // Mouse start X position
            scrollLeft = slider.scrollLeft // Scroll left position
        }

        const handleMouseLeave = () => {
            isDown = false // Mouse is not down
        }

        const handleMouseUp = e => {
            isDown = false // Mouse is not down
            slider.style.scrollBehavior = 'smooth' // Enable smooth scroll
            if (e.target.classList.contains(styles.slides)) isScrolling.current = false // If target is not slides, set is scrolling to true

            const referenceWidth = referenceSlideRef.current.getBoundingClientRect().width + 16 * 1.5 // Reference slide width + gap
            const scrollPos = walk < 0 ?
                Math.ceil(slider.scrollLeft / referenceWidth) * referenceWidth :
                walk > 0 ? Math.ceil(slider.scrollLeft / referenceWidth) * referenceWidth - referenceWidth : null

            if (scrollPos !== null) slider.scrollLeft = scrollPos // Scroll to position
            walk = 0 // Reset walk
        }

        const handleMouseMove = e => {
            if (!isDown) return // If mouse is not down, do nothing
            e.preventDefault() // Prevent default action
            if (!e.target.classList.contains(styles.slides)) isScrolling.current = true // If target is not slides, set is scrolling to true
            const x = e.pageX - slides.offsetLeft // Mouse X position
            walk = x - startX // Calculate walk
            slider.scrollLeft = scrollLeft - walk // Scroll to position
        }

        const handleScrollEnd = () => checkFading()

        const handlePrevClick = () => handleScroll(true)
        const handleNextClick = () => handleScroll()

        slides.addEventListener('mousedown', handleMouseDown)
        slides.addEventListener('mouseleave', handleMouseLeave)
        slides.addEventListener('mouseup', handleMouseUp)
        slides.addEventListener('mousemove', handleMouseMove)

        slider.addEventListener('scrollend', handleScrollEnd)

        prevButtonRef.current.addEventListener('click', handlePrevClick) // Scroll to previous slide
        nextButtonRef.current.addEventListener('click', handleNextClick) // Scroll to next slide

        return () => {
            slides.removeEventListener('mousedown', handleMouseDown)
            slides.removeEventListener('mouseleave', handleMouseLeave)
            slides.removeEventListener('mouseup', handleMouseUp)
            slides.removeEventListener('mousemove', handleMouseMove)

            slider.removeEventListener('scrollend', handleScrollEnd)

            prevButtonRef.current?.removeEventListener('click', handlePrevClick)
            nextButtonRef.current?.removeEventListener('click', handleNextClick)
        }
    }, [sliderRef, slidesRef, prevButtonRef, nextButtonRef, referenceSlideRef, items])

    const handlePlay = (e, type, index) => {
        e.stopPropagation() // Prevent click on parent element
        if (!type) return // If type is not defined, return
        if (type === 'track') {
            setQueue(items.filter(i => i?.type === 'track').map(i => ({id: i?._id, audio: i?.audio}))) // Set queue with tracks
            setQueueIndex(index || 0) // Set queue index to 0
        }
    }

    const handleOptions = e => {
        e.stopPropagation() // Prevent click on parent element
        // TODO: Show options
    }

    const handleItemMouseUp = (e, item) => {
        if (!isScrolling.current) { // If not scrolling, change route
            if (item?.type === 'artist') router.push('/artist/[id]', `/artist/${item?._id || item?.id}`)
            else if (item?.type === 'album') router.push('/album/[id]', `/album/${item?._id || item?.id}`)
            else if (item?.type === 'track') router.push('/track/[id]', `/track/${item?._id || item?.id}`)
        }
        else isScrolling.current = false // Set is scrolling to false
    }

    return (
        <div className={styles.container} ref={containerRef}>
            <div className={styles.header}>
                <div className={styles.title}>
                    {title}
                </div>
                <div className={styles.controls}>
                    {items?.length ? (
                        <span className={styles.control}
                              onClick={() => setShowAll(!showAllRef.current)}>{showAllRef.current ? 'Minimize' : 'View all'}</span>
                    ) : ''}
                    <TooltipHandler title={'Previous items'}>
                        <button className={`${styles.control} ${showAllRef.current ? styles.disabled : ''}`}
                                ref={prevButtonRef}>
                            <PrevIcon stroke="#b4b4b4" strokeWidth={20}/>
                        </button>
                    </TooltipHandler>
                    <TooltipHandler title={'Next items'}>
                        <button className={`${styles.control} ${showAllRef.current ? styles.disabled : ''}`}
                                ref={nextButtonRef}>
                            <NextIcon stroke="#b4b4b4" strokeWidth={20}/>
                        </button>
                    </TooltipHandler>
                </div>
            </div>
            <div className={styles.fading} ref={fadingRef}>
                <div className={styles.wrapper} ref={sliderRef}>
                    <div className={`${styles.slides} ${showAllRef.current ? styles.wrap : ''}`} ref={slidesRef}>
                        {items?.length ? items.map((item, i) =>
                            item?.type === 'album' ? (
                                <div className={`${styles.item} ${styles.album}`} key={i} ref={i === 0 ? referenceSlideRef : null}>
                                    <div className={styles.itemImage} onMouseUp={e => handleItemMouseUp(e, item)}>
                                        {item?.cover ? <img src={`${process.env.IMAGE_CDN}/${item.cover}`} alt={item?.title}/> : <AlbumDefault/>}
                                        <div className={styles.overlay}>
                                            <button className={`${styles.button} ${styles.play}`} onMouseUp={e => handlePlay(e, 'album')}>
                                                <PlayIcon/>
                                            </button>
                                            <button className={`${styles.button} ${styles.options}`} onMouseUp={handleOptions}>
                                                <OptionsIcon/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemName}>
                                            <Link href={'/album/[id]'} as={`/album/${item?.id || item?._id}`}>
                                                <TooltipHandler title={item?.title}>
                                                    {item?.title}
                                                </TooltipHandler>
                                            </Link>
                                        </div>
                                        <div className={styles.itemArtist}>
                                            <Link href={'/artist/[id]'} as={`/artist/${item?.artist?._id || item?.artist?.id}`}>
                                                {item?.artist?.name}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : item?.type === 'track' ? (
                                <div className={`${styles.item} ${styles.track}`} key={i} ref={i === 0 ? referenceSlideRef : null}>
                                    <div className={styles.itemImage} onMouseUp={e => handleItemMouseUp(e, item)}>
                                        {item?.album?.cover ? <img src={`${process.env.IMAGE_CDN}/${item?.album?.cover}`} alt={item?.title}/> : <AlbumDefault/>}
                                        <div className={styles.overlay}>
                                            <button className={`${styles.button} ${styles.play}`} onMouseUp={e => handlePlay(e, 'track', i)}>
                                                <PlayIcon/>
                                            </button>
                                            <button className={`${styles.button} ${styles.options}`} onMouseUp={handleOptions}>
                                                <OptionsIcon/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemName}>
                                            <Link href={'/album/[id]'} as={`/album/${item?.album?._id}#${item?._id}`}>
                                                <TooltipHandler title={item?.title}>
                                                    {item?.title}
                                                </TooltipHandler>
                                            </Link>
                                        </div>
                                        <div className={styles.itemArtist}>
                                            <Link href={'/artist/[id]'} as={`/artist/${item?.album?.artist?._id}`}>
                                                {item?.album?.artist?.name}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : item.type === 'artist' ? (
                                <div className={`${styles.item} ${styles.artist}`} key={i} ref={i === 0 ? referenceSlideRef : null}>
                                    <div className={styles.itemImage} onMouseUp={e => handleItemMouseUp(e, item)}>
                                        {item.image?.length ?
                                            <img src={`${process.env.IMAGE_CDN}/${item.image}`} alt={item.name}/> :
                                            <div className={styles.noImage}>{item?.name?.charAt(0)?.toUpperCase()}</div>}
                                        <div className={styles.overlay}>
                                            <button className={`${styles.button} ${styles.play}`} onMouseUp={e => handlePlay(e, 'artist')}>
                                                <PlayIcon/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemName}>
                                            <Link href={'/artist/[id]'} as={`/artist/${item._id}`}>
                                                {item.name}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : ''
                        ) : (
                            <div className={styles.noItems}>
                                No tracks, albums or artists found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}