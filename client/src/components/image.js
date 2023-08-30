import {useEffect, useState} from 'react'
import 'react-loading-skeleton/dist/skeleton.css'

export default function Image({src, width, height, format, alternative, loading, ...props}) {
    const [image, setImage] = useState(null) // Image state
    const [error, setError] = useState(false) // Error state

    useEffect(() => {
        if (!src || src === '0') return // If source is not defined, return

        const image = new window.Image() // Create image instance
        const widthQuery = width ? `?width=${width}` : '' // Get width query
        const heightQuery = height ? `${widthQuery ? '&' : '?'}height=${height}` : '' // Get height query
        const formatQuery = format ? `${heightQuery || widthQuery ? '&' : '?'}format=${format}` : '' // Get format query
        image.src = `${process.env.IMAGE_CDN}/${src}${widthQuery}${heightQuery}${formatQuery}` // Set image source
        image.onload = () => setImage(image) // If image is loaded, set image state
        image.onerror = () => setError(true) // If error occurred, set error state

        return () => { // When component is unmounted
            setImage(null) // Reset image state
            setError(false) // Reset error state
        }
    }, [src])

    return (
        <>
            {src === '0' ? (alternative || '') :
                !image && !error ? (loading || '') :
                    error ? (alternative || '') :
                        !image ? (loading || '') :
                            image?.src ? <img src={image.src} {...props}/> :
                                (alternative || '')}
        </>
    )
}