export default function AddIcon({stroke = '#fff', strokeWidth = 19, fill = 'none'}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeMiterlimit: 1.5,
            }}
            viewBox="0 0 256 256"
        >
            <path
                d="M128 18.403V241.54"
                style={{
                    fill,
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="matrix(.8963 0 0 .8963 12.88 11.113)"
            />
            <path
                d="M128 18.403V241.54"
                style={{
                    fill,
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="matrix(0 -.8963 .8963 0 11.113 242.335)"
            />
        </svg>
    )
}