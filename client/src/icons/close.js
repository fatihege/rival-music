export default function CloseIcon({stroke = '#fff', strokeRate = 1}) {
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
            <path
                d="M256 0 0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${31.05 * strokeRate}px`,
                }}
                transform="matrix(.0671 0 0 .0671 7.412 7.412)"
            />
            <path
                d="M256 0 0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${31.05 * strokeRate}px`,
                }}
                transform="matrix(0 -.0671 .0671 0 7.412 24.588)"
            />
        </svg>
    )
}