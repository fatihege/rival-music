import {useRouter} from 'next/router'

export default function SpanLink(props) {
    const router = useRouter()

    const getProps = () => {
        let newProps = {}
        Object.keys(props).map(k => k === 'className' ? newProps[k] = `${props[k]} cursor_pointer inline` : k !== 'href' ? newProps[k] = props[k] : false)
        if (!newProps.className) newProps.className = 'cursor_pointer inline'
        return newProps
    }

    return (
        <div onClick={() => router.push(props.href)} {...getProps()} suppressHydrationWarning={true}>
            {props.children}
        </div>
    )
}