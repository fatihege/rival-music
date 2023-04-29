export default function HomeIcon({filled = false, stroke = '#fff', fill = '#fff'}) {
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
            <path
                d="M97.725 248.462H64.337c-9.703 0-18.006-6.964-19.695-16.518L22.47 106.532a19.999 19.999 0 0 1 6.484-18.498l85.836-75.512c7.553-6.645 18.867-6.645 26.42 0l85.836 75.512a19.999 19.999 0 0 1 6.484 18.498l-22.172 125.412c-1.689 9.554-9.992 16.518-19.695 16.518h-33.388v-62.275c0-16.72-13.554-30.274-30.274-30.274h-.002c-16.72 0-30.274 13.554-30.274 30.274v62.275Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "14.58px",
                }}
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
            <path
                d="M97.725 248.462H64.337c-9.703 0-18.006-6.964-19.695-16.518L22.47 106.532a19.999 19.999 0 0 1 6.484-18.498l85.836-75.512c7.553-6.645 18.867-6.645 26.42 0l85.836 75.512a19.999 19.999 0 0 1 6.484 18.498l-22.172 125.412c-1.689 9.554-9.992 16.518-19.695 16.518h-33.388v-62.275c0-16.72-13.554-30.274-30.274-30.274h-.002c-16.72 0-30.274 13.554-30.274 30.274v62.275Z"
                style={{
                    fill,
                    stroke,
                    strokeWidth: "14.58px",
                }}
            />
        </svg>
    )
}