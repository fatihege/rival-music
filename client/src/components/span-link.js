import {useRouter} from 'next/router'

export default function SpanLink(props) {
    const router = useRouter()
    const EXCEPTED_PROPS = ['href', 'noRedirect', 'onClick'] // Props that should not be added to the new props object

    const getProps = () => {
        let newProps = {} // Create new props object
        Object.keys(props).map(k => k === 'className' ? newProps[k] = `${props[k]} cursor_pointer inline` : !EXCEPTED_PROPS.includes(k) ? newProps[k] = props[k] : false) // Add all props except EXCEPTED_PROPS to new props object
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