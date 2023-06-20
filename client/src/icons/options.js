export default function OptionsIcon({fill = '#fff'}) {
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
            viewBox="0 0 64 64"
        >
            <g transform="translate(-23.442 -4.366) scale(1.13645)">
                <circle
                    cx={32}
                    cy={32}
                    r={6.243}
                    style={{
                        fill,
                    }}
                />
                <circle
                    cx={32}
                    cy={32}
                    r={6.243}
                    style={{
                        fill,
                    }}
                    transform="translate(16.785)"
                />
                <circle
                    cx={32}
                    cy={32}
                    r={6.243}
                    style={{
                        fill,
                    }}
                    transform="translate(33.571)"
                />
            </g>
        </svg>
    )
}