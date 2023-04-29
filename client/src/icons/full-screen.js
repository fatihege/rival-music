export default function FullScreenIcon({stroke = '#fff', strokeWidth = 69}) {
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
                d="M256 0H123.503C55.294 0 0 55.294 0 123.503V256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="translate(50 50) scale(.21181)"
            />
            <path
                d="M256 0H123.503C55.294 0 0 55.294 0 123.503V256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="matrix(.21181 0 0 -.21181 50 206)"
            />
            <path
                d="M256 0H123.503C55.294 0 0 55.294 0 123.503V256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="matrix(-.21181 0 0 .21181 206 50)"
            />
            <path
                d="M256 0H123.503C55.294 0 0 55.294 0 123.503V256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="rotate(180 103 103) scale(.21181)"
            />
        </svg>
    )
}