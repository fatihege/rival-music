export default function AddIcon({stroke = '#fff', strokeRate = 1}) {
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
                d="M128 18.403V241.54"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${22 * strokeRate}px`,
                }}
                transform="matrix(.75492 0 0 .75492 30.977 29.489)"
            />
            <path
                d="M128 18.403V241.54"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${22 * strokeRate}px`,
                }}
                transform="matrix(0 -.75492 .75492 0 29.489 224.238)"
            />
        </svg>
    )
}