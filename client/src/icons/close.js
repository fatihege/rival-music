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
            viewBox="0 0 256 256"
        >
            <path
                d="M256 0 0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${32 * strokeRate}px`,
                }}
                transform="translate(62.603 62.603) scale(.51091)"
            />
            <path
                d="M256 0 0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${32 * strokeRate}px`,
                }}
                transform="rotate(-90 128 65.397) scale(.51091)"
            />
        </svg>
    )
}