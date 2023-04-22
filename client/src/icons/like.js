export default function LikeIcon({stroke = '#fff', strokeWidth = 10,  fill = 'none'}) {
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
                d="M135.065 99.048c19.686-19.483 40.37-17.877 53.826-5.817 13.457 12.061 13.457 36.182 0 60.303-8.755 16.816-30.3 33.631-49.503 45.604a8.214 8.214 0 0 1-8.645 0c-19.204-11.973-40.748-28.788-49.503-45.604-13.456-24.121-13.456-48.242 0-60.303 13.456-12.06 34.14-13.666 53.825 5.817Z"
                style={{
                    fill,
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="matrix(1.5645 0 0 1.58076 -83.31 -98.075)"
            />
        </svg>
    )
}