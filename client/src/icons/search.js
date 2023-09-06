export default function SearchIcon({stroke = '#fff', strokeRate = 1, fill = 'none'}) {
    return !fill ? (
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
            <g transform="matrix(.32086 0 0 .32086 -23.53 -20.84)">
                <circle
                    cx={115.184}
                    cy={106.804}
                    r={38.942}
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${5.68 * strokeRate}px`,
                    }}
                />
                <path
                    d="m115.294 106.914 27.416 27.416"
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${5.68 * strokeRate}px`,
                    }}
                    transform="translate(27.44 27.44)"
                />
            </g>
        </svg>
    ) : (
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
            <g transform="matrix(.32086 0 0 .32086 -23.53 -20.84)">
                <circle
                    cx={115.184}
                    cy={106.804}
                    r={38.942}
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${5.68 * strokeRate}px`,
                    }}
                />
                <circle
                    cx={115.184}
                    cy={106.804}
                    r={38.942}
                    style={{
                        fill,
                    }}
                    transform="matrix(.7633 0 0 .7633 27.264 25.28)"
                />
                <path
                    d="m115.294 106.914 27.416 27.416"
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${5.68 * strokeRate}px`,
                    }}
                    transform="translate(27.44 27.44)"
                />
            </g>
        </svg>
    )
}