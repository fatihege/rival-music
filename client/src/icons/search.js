export default function SearchIcon({filled = false, stroke = '#fff', strokeWidth = 6, fill = '#fff'}) {
    return !filled ? (
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
            <g transform="translate(-188.232 -166.722) scale(2.56691)">
                <circle
                    cx={115.184}
                    cy={106.804}
                    r={38.942}
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${strokeWidth}px`,
                    }}
                />
                <path
                    d="m115.294 106.914 27.416 27.416"
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${strokeWidth}px`,
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
            viewBox="0 0 256 256"
        >
            <g transform="translate(-188.232 -166.722) scale(2.56691)">
                <circle
                    cx={115.184}
                    cy={106.804}
                    r={38.942}
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${strokeWidth}px`,
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
                        strokeWidth: `${strokeWidth}px`,
                    }}
                    transform="translate(27.44 27.44)"
                />
            </g>
        </svg>
    )
}