export default function RightArrowIcon({stroke = '#fff', strokeWidth = 33}) {
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
                d="m0 0 178.742 121.097a8.34 8.34 0 0 1 0 13.806L0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="matrix(.63955 0 0 .63955 77.585 46.137)"
            />
        </svg>
    )
}