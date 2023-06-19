import Link from 'next/link'
import {useHistory} from '@/pages/_app'

export default function CustomLink(props) {
    const [,, flushForward] = useHistory()

    const getProps = () => {
        const newProps = {}

        Object.entries(props).forEach(([k, v]) => {
            if (k === 'onClick') newProps.onClick = e => {
                v(e)
                flushForward()
            }
            else if (k !== 'children') newProps[k] = v
        })

        return newProps
    }

    return (
        <Link {...getProps()}>
            {props.children}
        </Link>
    )
}