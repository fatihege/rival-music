export default function DiscIcon({stroke = '#fff', strokeRate = 1}) {
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
                cx={16}
                cy={16}
                r={12.63}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${2.45 * strokeRate}px`,
                }}
            />
            <circle
                cx={16}
                cy={16}
                r={12.63}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${8.87 * strokeRate}px`,
                }}
                transform="matrix(.2766 0 0 .2766 11.575 11.575)"
            />
        </svg>
    )
}