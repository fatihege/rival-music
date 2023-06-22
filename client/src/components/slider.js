import {useRouter} from 'next/router'
import {useEffect, useRef, useState} from 'react'
import Link from '@/components/custom-link'
import {NextIcon, OptionsIcon, PlayIcon, PrevIcon} from '@/icons'
import styles from '@/styles/slider.module.sass'

export default function Slider({title, items = []}) {
    const router = useRouter() // Router hook
    const containerRef = useRef() // Slider container
    const sliderRef = useRef() // Slider wrapper
    const slidesRef = useRef() // Slides container
    const prevButtonRef = useRef() // Previous button
    const nextButtonRef = useRef() // Next button
    const referenceSlideRef = useRef() // Reference slide
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
            slider.style.scrollBehavior = 'unset' // Disable smooth scroll
            isDown = true // Mouse is down
            startX = e.pageX - slides.offsetLeft // Mouse start X position
            scrollLeft = slider.scrollLeft // Scroll left position
        }

        const handleMouseLeave = () => {
            isDown = false // Mouse is not down
        }

        const handleMouseUp = () => {
            isDown = false // Mouse is not down
            slider.style.scrollBehavior = 'smooth' // Enable smooth scroll

            const referenceWidth = referenceSlideRef.current.getBoundingClientRect().width + 16 * 1.5 // Reference slide width + gap
            const scrollPos = walk < 0 ?
                Math.ceil(slider.scrollLeft / referenceWidth) * referenceWidth :
                walk > 0 ? Math.ceil(slider.scrollLeft / referenceWidth) * referenceWidth - referenceWidth : null

            if (scrollPos !== null) slider.scrollLeft = scrollPos // Scroll to position
            walk = 0 // Reset walk
        }

        const handleMouseMove = (e) => {
            if (!isDown) return // If mouse is not down, do nothing
            e.preventDefault() // Prevent default action
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

    const handlePlay = (e) => {
        e.stopPropagation() // Prevent click on parent element
        // TODO: Play song
    }

    return (
        <div className={styles.container} ref={containerRef}>
            <div className={styles.header}>
                <div className={styles.title}>
                    {title}
                </div>
                <div className={styles.controls}>
                    <button className={`${styles.control} ${showAllRef.current ? styles.disabled : ''}`}
                            ref={prevButtonRef}>
                        <PrevIcon stroke="#b4b4b4" strokeWidth={20}/>
                    </button>
                    <button className={`${styles.control} ${showAllRef.current ? styles.disabled : ''}`}
                            ref={nextButtonRef}>
                        <NextIcon stroke="#b4b4b4" strokeWidth={20}/>
                    </button>
                    <span className={styles.control}
                          onClick={() => setShowAll(!showAllRef.current)}>{showAllRef.current ? 'Minimize' : 'View all'}</span>
                </div>
            </div>
            <div className={styles.fading} ref={fadingRef}>
                <div className={styles.wrapper} ref={sliderRef}>
                    <div className={`${styles.slides} ${showAllRef.current ? styles.wrap : ''}`} ref={slidesRef}>
                        {items.map((item, i) => (
                            <div className={styles.item} key={item.id} ref={i === 0 ? referenceSlideRef : null}>
                                <div className={styles.itemImage}>
                                    <img src={item.image} alt={item.name}/>
                                    <div className={styles.overlay}>
                                        <button className={`${styles.button} ${styles.play}`} onClick={handlePlay}>
                                            <PlayIcon/>
                                        </button>
                                        <button className={`${styles.button} ${styles.options}`}>
                                            <OptionsIcon/>
                                        </button>
                                    </div>
                                </div>
                                <div className={styles.itemInfo}>
                                    <div className={styles.itemName}>
                                        <Link href="/">
                                            {item.name}
                                        </Link>
                                    </div>
                                    <div className={styles.itemArtist}>
                                        <Link href="/">
                                            {item.artist}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}