import {useRouter} from 'next/router'

export default function SpanLink(props) {
    const router = useRouter()

    const getProps = () => {
        let newProps = {}
        Object.keys(props).map(k => k === 'className' ? newProps[k] = `${props[k]} cursor_pointer` : k !== 'href' ? newProps[k] = props[k] : false)
        return newProps
    }

    return (
        <span onClick={() => router.push(props.href)} {...getProps()}>
            {props.children}
        </span>
    )
}