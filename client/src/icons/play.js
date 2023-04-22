export default function PlayIcon({fill = '#1c1c1c'}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinejoin: "round",
                strokeMiterlimit: 2,
            }}
            viewBox="0 0 256 256"
        >
            <path
                d="M0 41.144a22.874 22.874 0 0 1 34.946-19.428l147.296 91.533a17.368 17.368 0 0 1 0 29.502L34.946 234.284A22.874 22.874 0 0 1 0 214.856V41.144Z"
                style={{
                    fill,
                }}
                transform="translate(18.38 -19.355) scale(1.15121)"
            />
        </svg>
    )
}