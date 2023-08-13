export default function DeleteIcon({stroke = '#fff', strokeRate = 1}) {
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
            viewBox="0 0 64 64"
        >
            <path
                d="M42.336 23.318H21.499l3.259 19.092a1.503 1.503 0 0 0 1.481 1.249h11.357c.732 0 1.357-.528 1.48-1.249l3.26-19.092Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${2.3 * strokeRate}px`,
                }}
                transform="translate(-25.71 -23.236) scale(1.80812)"
            />
            <path
                d="M21.581 25.815h20.838"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${2.07 * strokeRate}px`,
                }}
                transform="matrix(2.19844 0 0 1.80812 -38.35 -27.751)"
            />
            <path
                d="M27.101 25.815A4.983 4.983 0 0 1 32 19.936a4.983 4.983 0 0 1 4.899 5.879h-9.798Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${2.3 * strokeRate}px`,
                }}
                transform="translate(-25.86 -27.751) scale(1.80812)"
            />
        </svg>
    )
}