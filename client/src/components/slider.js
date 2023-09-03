import axios from 'axios'
import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {QueueContext} from '@/contexts/queue'
import {ModalContext} from '@/contexts/modal'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import Link from '@/components/link'
import Image from '@/components/image'
import {TooltipHandler} from '@/components/tooltip'
import PlaylistImage from '@/components/playlist-image'
import {AlbumDefault, NextThinIcon, OptionsIcon, PlayIcon, PrevThinIcon} from '@/icons'
import styles from '@/styles/slider.module.sass'
import AskLoginModal from '@/components/modals/ask-login'
import Skeleton from 'react-loading-skeleton'

/**
 * @param {'artist' | 'album' | 'playlist' | 'track'} type
 * @param {string} title
 * @param {Array} items
 * @returns {JSX.Element}
 * @constructor
 */
export default function Slider({type, title, items = []}) {
    const [user] = useContext(AuthContext) // Get user from auth context
    const {setQueue, setQueueIndex, handlePlayPause, showQueuePanel} = useContext(QueueContext) // Queue context
    const [, setModal] = useContext(ModalContext) // Modal context
    const [navbarWidth] = useContext(NavigationBarContext) // Navigation bar width
    const [albumWidth, setAlbumWidth] = useState(0) // Album width
    const [artistWidth, setArtistWidth] = useState(0) // Artist width
    const albumWidthRef = useRef(albumWidth) // Album width reference
    const artistWidthRef = useRef(artistWidth) // Artist width reference
    const router = useRouter() // Router instance
    const isScrolling = useRef(false) // Is slider scrolling
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

    const getItemWidth = () => Math.max(Math.min(type === 'artist' ? artistWidthRef.current : albumWidthRef.current, 250), 160)

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
            const referenceWidth = getItemWidth() + 20 // Item width + gap
            const scrollAmount = (prev ? -1 : 1) * (referenceSlideRect ? sliderRect.width / referenceWidth * referenceWidth : 400) + (prev ? 0 : referenceWidth) // Calculate scroll amount
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
            checkFading()
        }

        const handleMouseLeave = () => {
            isDown = false // Mouse is not down
        }

        const handleMouseUp = e => {
            isDown = false // Mouse is not down
            slider.style.scrollBehavior = 'smooth' // Enable smooth scroll
            if (e.target.classList.contains(styles.slides)) isScrolling.current = false // If target is not slides, set is scrolling to true

            const referenceWidth = getItemWidth() + 20 // Item width + gap
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

    useEffect(() => {
        if (!containerRef.current) return // Check if container is exist
        const container = containerRef.current // Slider container reference
        const containerWidth = container.getBoundingClientRect().width // Get container width
        const albumWidth = Math.min(Math.max(containerWidth / 6 - 17, 160), 250) // Calculate album width
        const artistWidth = Math.min(Math.max(containerWidth / 7 - 17, 160), 200) // Calculate artist width

        setAlbumWidth(albumWidth) // Set album width to calculate slide width
        setArtistWidth(artistWidth) // Set artist width to calculate slide width
        albumWidthRef.current = albumWidth // Set album width reference
        artistWidthRef.current = artistWidth // Set artist width reference
    }, [navbarWidth])

    const handlePlay = (e, itemType, index) => {
        e.stopPropagation() // Prevent click on parent element

        if (!user?.id || !user?.token) return setModal({ // If track ID is not defined or user is not logged in, open ask login modal
            active: <AskLoginModal/>,
            canClose: true,
        })

        if (!itemType) itemType = type
        if (itemType === 'track') {
            setQueue(items.filter(i => !i?.type || i?.type === 'track').map(i => ({id: i?._id, audio: i?.audio}))) // Set queue with tracks
            setQueueIndex(index || 0) // Set queue index to 0
            handlePlayPause(true) // Play track
        } else if (itemType === 'album') {
            try {
                axios.get(`${process.env.API_URL}/album/${items[index]?._id}?tracks=1`).then(response => {
                    if (response.data.status === 'OK' && response.data?.album) {
                        setQueue(response.data?.album?.tracks?.filter(t => !!t?.audio)?.map(i => ({id: i?._id, audio: i?.audio}))) // Set queue with album tracks
                        setQueueIndex(0) // Set queue index to 0
                        handlePlayPause(true) // Play tracks
                    }
                })
            } catch (e) {
                console.error(e)
            }
        } else if (itemType === 'playlist') {
            try {
                axios.get(`${process.env.API_URL}/playlist/${items[index]?._id}?tracks=1`).then(response => {
                    if (response.data.status === 'OK' && response.data?.playlist) {
                        setQueue(response.data?.playlist?.tracks?.filter(t => !!t?.audio)?.map(i => ({id: i?._id, audio: i?.audio}))) // Set queue with playlist tracks
                        setQueueIndex(0) // Set queue index to 0
                        handlePlayPause(true) // Play tracks
                    }
                })
            } catch (e) {
                console.error(e)
            }
        }
    }

    const handleOptions = e => {
        e.stopPropagation() // Prevent click on parent element
        // TODO: Show options
    }

    const handleItemMouseUp = (e, item) => {
        if (!isScrolling.current) { // If not scrolling, change route
            if ((item?.type && item.type === 'artist') || (!item?.type && type === 'artist')) router.push('/artist/[id]', `/artist/${item?._id}`)
            else if ((item?.type && item.type === 'album') || (!item?.type && type === 'album')) router.push('/album/[id]', `/album/${item?._id}`)
            else if ((item?.type && item.type === 'playlist') || (!item?.type && type === 'playlist')) router.push('/playlist/[id]', `/playlist/${item?._id}`)
            else if ((item?.type && item.type === 'track') || (!item?.type && type === 'track')) router.push('/album/[id]', `/album/${item?.album?._id}#${item?._id}`)
        }
        else isScrolling.current = false // Set is scrolling to false
    }

    return (
        <div className={`${styles.container} ${showAllRef.current ? styles.all : ''}`} ref={containerRef}>
            <div className={styles.header}>
                <div className={styles.title}>
                    {title}
                </div>
                <div className={styles.showAll}>
                    {Array.isArray(items) && items?.length && items.length > 1 ? (
                        <span onClick={() => setShowAll(!showAllRef.current)}>{showAllRef.current ? 'Minimize' : 'View all'}</span>
                    ) : ''}
                </div>
            </div>
            <div className={styles.fading} ref={fadingRef}>
                <button className={`${styles.control} ${styles.left} ${showAllRef.current ? styles.hide : ''}`} ref={prevButtonRef}>
                    <PrevThinIcon/>
                </button>
                <div className={styles.wrapper} ref={sliderRef}>
                    <div className={`${styles.slides} ${showAllRef.current ? styles.wrap : ''}`} ref={slidesRef}>
                        {Array.isArray(items) ? (items?.length ? items.map((item, i) =>
                            (item?.type && item.type === 'album') || (!item?.type && type === 'album') ? (
                                <div className={`${styles.item} ${styles.album}`} key={i} ref={i === 0 ? referenceSlideRef : null}
                                     style={{width: albumWidth || ''}}>
                                    <div className={styles.itemImage} onMouseUp={e => handleItemMouseUp(e, item)}
                                    style={{width: albumWidth || '', height: albumWidth || ''}}>
                                        <Image src={item?.cover || '0'} width={250} height={250} format={'webp'}
                                               alt={item?.title} alternative={<AlbumDefault/>}
                                               loading={<Skeleton height={albumWidth} width={albumWidth} style={{top: '-2px'}}/>}/>
                                        <div className={styles.overlay}>
                                            <button className={`${styles.button} ${styles.play}`} onMouseUp={e => handlePlay(e, 'album', i)}>
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
                                        <div className={styles.itemOwner}>
                                            <Link href={'/artist/[id]'} as={`/artist/${item?.artist?._id || item?.artist?.id}`}>
                                                {item?.artist?.name}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (item?.type && item.type === 'playlist') || (!item?.type && type === 'playlist') ? (
                                <div className={`${styles.item} ${styles.playlist}`} key={i} ref={i === 0 ? referenceSlideRef : null}
                                     style={{width: albumWidth || ''}}>
                                    <div className={styles.itemImage} onMouseUp={e => handleItemMouseUp(e, item)}
                                    style={{width: albumWidth || '', height: albumWidth || ''}}>
                                        <PlaylistImage playlist={item} width={250} height={250}/>
                                        <div className={styles.overlay}>
                                            <button className={`${styles.button} ${styles.play}`} onMouseUp={e => handlePlay(e, 'playlist', i)}>
                                                <PlayIcon/>
                                            </button>
                                            <button className={`${styles.button} ${styles.options}`} onMouseUp={handleOptions}>
                                                <OptionsIcon/>
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.itemInfo}>
                                        <div className={styles.itemName}>
                                            <Link href={'/playlist/[id]'} as={`/playlist/${item?.id || item?._id}`}>
                                                <TooltipHandler title={item?.title}>
                                                    {item?.title}
                                                </TooltipHandler>
                                            </Link>
                                        </div>
                                        <div className={styles.itemOwner}>
                                            <Link href={'/profile/[id]'} as={`/profile/${item?.owner?._id || item?.owner?.id}`}>
                                                {item?.owner?.name}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (item?.type && item.type === 'track') || (!item?.type && type === 'track') ? (
                                <div className={`${styles.item} ${styles.track}`} key={i} ref={i === 0 ? referenceSlideRef : null}
                                     style={{width: albumWidth || ''}}>
                                    <div className={styles.itemImage} onMouseUp={e => handleItemMouseUp(e, item)}
                                    style={{width: albumWidth || '', height: albumWidth || ''}}>
                                        <Image src={item?.album?.cover || '0'} width={250} height={250} format={'webp'}
                                               alt={item?.title} alternative={<AlbumDefault/>}
                                               loading={<Skeleton height={albumWidth} width={albumWidth} style={{top: '-2px'}}/>}/>
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
                                        <div className={styles.itemOwner}>
                                            <Link href={'/artist/[id]'} as={`/artist/${item?.album?.artist?._id}`}>
                                                {item?.album?.artist?.name}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (item?.type && item.type === 'artist') || (!item?.type && type === 'artist') ? (
                                <div className={`${styles.item} ${styles.artist}`} key={i} ref={i === 0 ? referenceSlideRef : null}
                                     style={{width: artistWidth || ''}}>
                                    <div className={styles.itemImage} onMouseUp={e => handleItemMouseUp(e, item)}
                                    style={{width: artistWidth || '', height: artistWidth || ''}}>
                                        <Image src={item?.image || '0'} width={200} height={200} format={'webp'} alt={item?.title} alternative={
                                            <div className={styles.noImage}>{item?.name?.charAt(0)?.toUpperCase()}</div>
                                        } loading={<Skeleton height={artistWidth} width={artistWidth} borderRadius={'100%'}/>}/>
                                        <div className={styles.overlay}>
                                            <button className={`${styles.button} ${styles.play}`} onMouseUp={e => handlePlay(e, 'artist', i)}>
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
                                There is no {type === 'artist' ? 'artists' : type === 'album' ? 'albums' : type === 'playlist' ? 'playlists' : 'tracks'} to show.
                            </div>
                        )) : (() => {
                            const skeletons = []

                            for (let i = 0; i < 6; i++)
                                skeletons.push(
                                    <div key={i} className={`${styles.item} ${type === 'artist' ? styles.artist : ''} ${styles.loading}`}
                                        style={{width: type === 'artist' ? artistWidth : albumWidth}}>
                                        <div className={styles.itemImage}
                                                style={{width: type === 'artist' ? artistWidth : albumWidth,
                                                    height: type === 'artist' ? artistWidth : albumWidth}}>
                                            <Skeleton width={type === 'artist' ? artistWidth : albumWidth}
                                                      height={type === 'artist' ? artistWidth : albumWidth}
                                                      style={{top: '-1px'}} borderRadius={type === 'artist' ? '50%' : '0'}/>
                                        </div>
                                        <div className={styles.itemInfo}>
                                            {type !== 'artist' ? (
                                                <div className={styles.itemName}>
                                                    <Skeleton/>
                                                </div>
                                            ) : ''}
                                            <div className={styles.itemOwner}>
                                                <Skeleton height={16} width={120}/>
                                            </div>
                                        </div>
                                    </div>
                                )

                            return skeletons
                        })()}
                    </div>
                </div>
                <button className={`${styles.control} ${styles.right} ${showAllRef.current ? styles.hide : ''}`} ref={nextButtonRef}>
                    <NextThinIcon/>
                </button>
            </div>
        </div>
    )
}