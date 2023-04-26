export default function CustomizationIcon({stroke = '#fff', filled = false, fill = '#fff'}) {
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
            <circle
                cx={70.819}
                cy={63.754}
                r={16.924}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "11.31px",
                }}
                transform="matrix(1.28944 0 0 1.28944 77.404 -8.637)"
            />
            <circle
                cx={70.819}
                cy={63.754}
                r={16.924}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "11.31px",
                }}
                transform="matrix(1.28944 0 0 1.28944 -4.931 45.794)"
            />
            <path
                d="M69.727 113.754H39.928"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "13.4px",
                }}
                transform="translate(-11.343 4.166) scale(1.08862)"
            />
            <circle
                cx={70.819}
                cy={63.754}
                r={16.924}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "11.31px",
                }}
                transform="matrix(1.28944 0 0 1.28944 77.404 100.225)"
            />
            <path
                d="M145.359 63.754H39.928M185.452 63.754h30.62M109.819 113.754h106.253M216.072 163.754h-30.62M145.359 163.754H39.928"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "13.4px",
                }}
                transform="translate(-11.343 4.166) scale(1.08862)"
            />
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
            <circle
                cx={70.819}
                cy={63.754}
                r={16.924}
                style={{
                    fill,
                    stroke,
                    strokeWidth: "11.31px",
                }}
                transform="matrix(1.28944 0 0 1.28944 77.404 -8.637)"
            />
            <circle
                cx={70.819}
                cy={63.754}
                r={16.924}
                style={{
                    fill,
                    stroke,
                    strokeWidth: "11.31px",
                }}
                transform="matrix(1.28944 0 0 1.28944 -4.931 45.794)"
            />
            <path
                d="M69.727 113.754H39.928"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "13.4px",
                }}
                transform="translate(-11.343 4.166) scale(1.08862)"
            />
            <circle
                cx={70.819}
                cy={63.754}
                r={16.924}
                style={{
                    fill,
                    stroke,
                    strokeWidth: "11.31px",
                }}
                transform="matrix(1.28944 0 0 1.28944 77.404 100.225)"
            />
            <path
                d="M145.359 63.754H39.928M185.452 63.754h30.62M109.819 113.754h106.253M216.072 163.754h-30.62M145.359 163.754H39.928"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "13.4px",
                }}
                transform="translate(-11.343 4.166) scale(1.08862)"
            />
        </svg>
    )
}