export default function ShuffleIcon({stroke = '#fff', strokeRate = 1}) {
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
                d="m199.774 199.774-59.003-59.003"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${15.95 * strokeRate}px`,
                }}
                transform="matrix(.91415 0 0 .91415 -78.49 -78.49)"
            />
            <path
                d="m199.774 199.774-59.003-59.003"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${15.95 * strokeRate}px`,
                }}
                transform="matrix(.91415 0 0 .91415 23.18 23.18)"
            />
            <path
                d="M256 0 0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${23.99 * strokeRate}px`,
                }}
                transform="translate(50.196 50.196) scale(.60784)"
            />
            <path
                d="m0 0 128 128L0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${70.03 * strokeRate}px`,
                }}
                transform="scale(-.20824) rotate(-45 -1403.993 15.336)"
            />
            <path
                d="m0 0 128 128L0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${70.03 * strokeRate}px`,
                }}
                transform="scale(.20824) rotate(-45 694.597 -853.927)"
            />
        </svg>
    )
}