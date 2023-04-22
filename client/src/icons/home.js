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
                d="M128.004 98.129a8.825 8.825 0 0 1 11.658 0l37.876 33.32a8.827 8.827 0 0 1 2.861 8.163l-9.784 55.338a8.825 8.825 0 0 1-8.69 7.289h-56.184a8.825 8.825 0 0 1-8.69-7.289l-9.784-55.338a8.827 8.827 0 0 1 2.861-8.163l37.876-33.32Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "6.43px",
                }}
                transform="translate(-175.3 -209.864) scale(2.26626)"
            />
            <circle
                cx={133.833}
                cy={141.375}
                r={13.745}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "6.66px",
                }}
                transform="translate(-165.058 -181.984) scale(2.18973)"
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
                d="M114.79 12.522c7.553-6.645 18.867-6.645 26.42 0l85.836 75.512a19.999 19.999 0 0 1 6.484 18.498l-22.172 125.412c-1.689 9.554-9.992 16.518-19.695 16.518H64.337c-9.703 0-18.006-6.964-19.695-16.518L22.47 106.532a19.999 19.999 0 0 1 6.484-18.498l85.836-75.512ZM128 90.199c-20.636 0-37.389 16.754-37.389 37.389 0 20.636 16.753 37.389 37.389 37.389 20.636 0 37.389-16.753 37.389-37.389 0-20.635-16.753-37.389-37.389-37.389Z"
                style={{
                    fill,
                    stroke,
                    strokeWidth: "14.58px",
                }}
            />
        </svg>
    )
}