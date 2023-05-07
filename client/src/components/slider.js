import Link from 'next/link'
import {useEffect, useRef} from 'react'
import {NextIcon, PlayIcon, PrevIcon} from '@/icons'
import styles from '@/styles/slider.module.sass'

export default function Slider({title, items = []}) {
    for (let i = 0; i < 4; i++)
        for (let id = 1; id <= 6; id++)
            items.push({
                id: id + i * 6,
                name: id === 6 ? 'Ride The Lightning' : id === 5 ? 'Fear of the Dark (2015 Remaster)' : id === 4 ? 'Hells Bells' : id === 3 ? 'The Devil in I' : id === 2 ? 'Heaven and Hell - 2009 Remaster' : 'Seek & Destroy - Remastered',
                artist: id === 5 ? 'Iron Maiden' : id === 4 ? 'AC/DC' : id === 3 ? 'Slipknot' : id === 2 ? 'Black Sabbath' : 'Metallica',
                image: id === 6 ? '/album_cover_6.jpg' : id === 5 ? '/album_cover_5.jpg' : id === 4 ? '/album_cover_4.jpg' : id === 3 ? '/album_cover_3.jpg' : id === 2 ? '/album_cover_2.jpg' : '/album_cover_1.jpg',
            })

    const sliderRef = useRef() // Slider wrapper
    const slidesRef = useRef() // Slides container
    const prevButtonRef = useRef() // Previous button
    const nextButtonRef = useRef() // Next button
    const referenceSlideRef = useRef() // Reference slide

    useEffect(() => {
        if (!sliderRef.current || !slidesRef.current || !referenceSlideRef.current) return // Check if all elements exist

        const slider = sliderRef.current // Slider wrapper
        const slides = slidesRef.current // Slides container
        let isDown = false // Mouse is down
        let startX // Mouse start X position
        let scrollLeft // Scroll left position
        let walk // Mouse walk

        const checkControls = () => {
            const scrollLeft = slider.scrollLeft
            const scrollRight = slider.scrollWidth - slider.scrollLeft - slider.clientWidth

            if (scrollLeft <= 0) prevButtonRef.current.classList.add(styles.disabled)
            else prevButtonRef.current.classList.remove(styles.disabled)

            if (scrollRight <= 0) nextButtonRef.current.classList.add(styles.disabled)
            else nextButtonRef.current.classList.remove(styles.disabled)
        }

        const handleScroll = (prev = false) => { // Scroll to previous or next slide
            const sliderRect = slider?.getBoundingClientRect() // Slider wrapper rectangle
            const referenceSlideRect = referenceSlideRef.current?.getBoundingClientRect() // Reference slide rectangle
            const referenceWidth = referenceSlideRect.width + 16 * 1.5 // Reference slide width + gap
            const scrollAmount = (prev ? -1 : 1) * (referenceSlideRect ? sliderRect.width / referenceWidth * referenceWidth : 400) // Calculate scroll amount
            const snapScroll = (slider.scrollLeft + scrollAmount) % referenceWidth // Calculate scroll amount to snap to next slide

            slider.style.scrollBehavior = 'smooth' // Enable smooth scroll
            slider.scrollLeft = Math.min(slider.scrollLeft + scrollAmount - snapScroll, slider.scrollWidth - slider.clientWidth) // Scroll to slide
            checkControls() // Check if controls should be disabled
        }

        window.addEventListener('resize', checkControls) // Check if controls should be disabled on resize
        slider.addEventListener('scroll', checkControls) // Check if controls should be disabled on scroll

        slides.addEventListener('mousedown', (e) => {
            slider.style.scrollBehavior = 'unset' // Disable smooth scroll
            isDown = true // Mouse is down
            startX = e.pageX - slides.offsetLeft // Mouse start X position
            scrollLeft = slider.scrollLeft // Scroll left position
        })

        slides.addEventListener('mouseleave', () => {
            isDown = false // Mouse is not down
        })

        slides.addEventListener('mouseup', () => {
            isDown = false // Mouse is not down
            slider.style.scrollBehavior = 'smooth' // Enable smooth scroll

            const referenceWidth = referenceSlideRef.current.getBoundingClientRect().width + 16 * 1.5 // Reference slide width + gap
            const scrollPos = walk < 0 ?
                Math.ceil(slider.scrollLeft / referenceWidth) * referenceWidth :
                Math.ceil(slider.scrollLeft / referenceWidth) * referenceWidth - referenceWidth // Calculate scroll position

            slider.scrollLeft = scrollPos // Scroll to position
        })

        slides.addEventListener('mousemove', (e) => {
            if (!isDown) return // If mouse is not down, do nothing
            e.preventDefault() // Prevent default action
            const x = e.pageX - slides.offsetLeft // Mouse X position
            walk = x - startX // Calculate walk
            slider.scrollLeft = scrollLeft - walk // Scroll to position
        })

        prevButtonRef.current.addEventListener('click', () => handleScroll(true)) // Scroll to previous slide
        nextButtonRef.current.addEventListener('click', () => handleScroll()) // Scroll to next slide
    }, [sliderRef, slidesRef, prevButtonRef, nextButtonRef, referenceSlideRef])

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    {title}
                </div>
                <div className={styles.controls}>
                    <button className={`${styles.control} ${styles.disabled}`} ref={prevButtonRef}>
                        <PrevIcon stroke="#b4b4b4" strokeWidth={20}/>
                    </button>
                    <button className={styles.control} ref={nextButtonRef}>
                        <NextIcon stroke="#b4b4b4" strokeWidth={20}/>
                    </button>
                    <Link href="/" className={styles.control}>View all</Link>
                </div>
            </div>
            <div className={styles.wrapper} ref={sliderRef}>
                <div className={styles.slides} ref={slidesRef}>
                    {items.map((item, i) => (
                        <div className={styles.item} key={item.id} ref={i === 0 ? referenceSlideRef : null}>
                            <div className={styles.itemImage}>
                                <img src={item.image} alt={item.name}/>
                                <div className={styles.overlay}>
                                    <PlayIcon/>
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
    )
}