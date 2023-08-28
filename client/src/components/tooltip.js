import {useContext, useEffect, useRef} from 'react'
import {TooltipContext} from '@/contexts/tooltip'
import styles from '@/styles/tooltip.module.sass'

export default function Tooltip() {
    const [tooltip] = useContext(TooltipContext) // Get tooltip properties from tooltip context

    return (
        <span className={`${styles.tooltip} ${tooltip.show && tooltip.title?.length ? styles.show : ''}`}
              style={{left: `${tooltip.x}px`, top: `${tooltip.y}px`, transformOrigin: tooltip.transformOrigin || '50% 250%'}}>{tooltip.title}</span>
    )
}

export function TooltipHandler({title, children}) {
    const [tooltip, setTooltip] = useContext(TooltipContext) // Use tooltip context for getting/setting the properties
    const mouseOver = useRef(false) // Is mouse over on this component
    const tooltipTimeout = useRef(null) // Timeout reference for tooltip
    const handlerRef = useRef() // Handler span reference

    const handleMouseOver = () => {
        mouseOver.current = true // Set mouse over state to true
        clearTimeout(tooltipTimeout.current)
        tooltipTimeout.current = setTimeout(() => {
            const rect = handlerRef?.current?.getBoundingClientRect() // Get client rectangle from handler span
            if (!rect?.x && !rect?.y && !rect?.width && !rect?.height) return // If dimensions are incorrect, return
            if (mouseOver.current) setTooltip({ // If mouse is over handler span, update tooltip data
                title,
                show: true,
                x: rect.x + rect.width < window.innerWidth ? rect.x + rect.width / 2 + (rect.x < rect.width / 2 + 10 ? 16 : 0) : rect.x - 16,
                y: rect.y - 36 < 30 ? rect.y + rect.height + 12 : rect.y - 36,
                transformOrigin: rect.y - 36 < 30 ? '50% -250%' : '50% 250%'
            })
        }, 300) // After 300ms
    }

    const handleMouseLeave = () => {
        mouseOver.current = false // Set mouse over state to false
        setTooltip({ // Reset tooltip data
            title: '',
            show: false,
            x: -100,
            y: -100,
            transformOrigin: '',
        })
        clearTimeout(tooltipTimeout.current) // Clear the tooltip timeout
    }

    useEffect(() => { // When title changes
        if (mouseOver.current) setTooltip({...tooltip, title}) // If mouse is over this handler span, update title
    }, [title])

    useEffect(() => {
        return () => { // When component is unmounted
            mouseOver.current = false // Set mouse over state to false
            setTooltip({ // Reset tooltip data
                title: '',
                show: false,
                x: -100,
                y: -100,
                transformOrigin: '',
            })
            clearTimeout(tooltipTimeout.current) // Clear the tooltip timeout
        }
    }, [])

    return (
        <span suppressHydrationWarning={true} ref={handlerRef}
              onMouseOver={() => handleMouseOver()} onMouseLeave={() => handleMouseLeave()}>
            {children}
        </span>
    )
}