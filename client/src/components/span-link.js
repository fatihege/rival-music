import {useRouter} from 'next/router'

export default function SpanLink(props) {
    const router = useRouter()

    const getProps = () => {
        let newProps = {} // Create new props object
        Object.keys(props).map(k => k === 'className' ? newProps[k] = `${props[k]} cursor_pointer inline` : k !== 'href' && k !== 'onClick' ? newProps[k] = props[k] : false) // Add all props except href and onClick
        if (!newProps.className) newProps.className = 'cursor_pointer inline' // Add "cursor_pointer" and "inline" to className
        return newProps // Return new props
    }

    return (
        <div onClick={() => {
            if (props.onClick) props.onClick()
            if (!props.noRedirect) router.push(props.href)
        }} {...getProps()} suppressHydrationWarning={true}>
            {props.children}
        </div>
    )
}