export default function AlbumDefault({fill = '#161616', stroke = '#c7c7c7', strokeRate = 1}) {
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
            viewBox="0 0 600 600"
        >
            <path
                d="M0 0h600v600H0z"
                style={{
                    fill,
                }}
            />
            <circle
                cx={300}
                cy={300}
                r={46.512}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${23.54 * strokeRate}px`,
                }}
                transform="translate(-72.287 8.527) scale(1.16667)"
            />
            <path
                d="m354.264 300-17.83-171.318M336.434 128.682s1.55 46.899 62.403 46.899"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${27.46 * strokeRate}px`,
                    strokeLinecap: "butt",
                }}
                transform="translate(-22.287 58.527)"
            />
        </svg>
    )
}