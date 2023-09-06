export default function PlaylistIcon({stroke = '#fff', strokeRate = 1}) {
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
            <circle
                cx={300}
                cy={300}
                r={46.512}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${19.48 * strokeRate}px`,
                }}
                transform="translate(-26.575 -17.333) scale(.13342)"
            />
            <path
                d="m354.264 300-17.83-171.318M336.434 128.682s1.55 46.899 62.403 46.899"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${22.72 * strokeRate}px`,
                    strokeLinecap: "butt",
                }}
                transform="translate(-20.857 -11.615) scale(.11436)"
            />
        </svg>
    )
}