import NextLink from 'next/link'
import {useHistory} from '@/pages/_app'

export default function Link(props) {
    const [,, flushForward] = useHistory() // Get flushForward method from history hook

    const getProps = () => { // Filter props
        const newProps = {} // Create empty props object

        Object.entries(props).forEach(([k, v]) => { // Loop all entries of props
            if (k === 'onClick') newProps.onClick = e => { // If prop is onClick event
                v(e) // Call event
                flushForward() // And clear forward list
            }
            else if (k !== 'children') newProps[k] = v // Assign to the new props if prop is not child element
        })

        return newProps
    }

    return (
        <NextLink {...getProps()}>
            {props.children}
        </NextLink>
    )
}