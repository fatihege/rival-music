export default function RequestIcon({stroke = '#fff', strokeRate = 1}) {
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
            viewBox="0 0 32 32"
        >
            <path
                d="M27.721 11.653a7.373 7.373 0 0 0-7.374-7.374h-8.694a7.373 7.373 0 0 0-7.374 7.374v8.694a7.373 7.373 0 0 0 7.374 7.374h8.694a7.373 7.373 0 0 0 7.374-7.374v-8.694Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${1.72 * strokeRate}px`,
                }}
                transform="translate(-1.467 -1.467) scale(1.09171)"
            />
            <path
                d="M16 9.757v10.625"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${1.71 * strokeRate}px`,
                }}
                transform="translate(-1.556 -.536) scale(1.09728)"
            />
            <path
                d="M16 9.757v10.625"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${1.71 * strokeRate}px`,
                }}
                transform="rotate(-90 16.51 17.046) scale(1.09728)"
            />
        </svg>
    )
}