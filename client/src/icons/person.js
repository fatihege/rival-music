export default function PersonIcon({stroke = '#fff', strokeRate = 1}) {
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
            <g transform="translate(0 4.06)">
                <path
                    d="M32 12.507V8.25A8.25 8.25 0 0 0 23.75 0H8.25A8.25 8.25 0 0 0 0 8.25v4.257"
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${3.29 * strokeRate}px`,
                    }}
                    transform="translate(4.755 14.532) scale(.70284)"
                />
                <circle
                    cx={16}
                    cy={6.036}
                    r={5.478}
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${2.31 * strokeRate}px`,
                    }}
                />
            </g>
        </svg>
    )
}