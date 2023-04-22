export default function HomeIcon({stroke = '#fff'}) {
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
    )
}