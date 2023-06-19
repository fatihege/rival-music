export default function NextIcon({stroke = '#fff', strokeRate = 1}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinecap: "round",
                strokeMiterlimit: 1.5,
            }}
            viewBox="0 0 256 256"
        >
            <path
                d="m0 0 134.977 128L0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${32 * strokeRate}px`,
                }}
                transform="matrix(.63955 0 0 .63955 84.837 46.137)"
            />
        </svg>
    )
}