export default function LikeIcon({stroke = '#fff'}) {
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
                d="M135.065 99.048c19.686-19.483 40.37-17.877 53.826-5.817 13.457 12.061 13.457 36.182 0 60.303-8.87 17.036-30.866 34.072-50.257 46.072a6.816 6.816 0 0 1-7.137 0c-19.391-12-41.387-29.036-50.257-46.072-13.456-24.121-13.456-48.242 0-60.303 13.456-12.06 34.14-13.666 53.825 5.817Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "7.7px",
                }}
                transform="matrix(1.88502 0 0 1.9046 -126.601 -144.391)"
            />
        </svg>
    )
}