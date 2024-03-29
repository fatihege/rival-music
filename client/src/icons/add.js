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
            viewBox="0 0 32 32"
        >
            <path
                d="M128 18.403V241.54"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${22.08 * strokeRate}px`,
                }}
                transform="matrix(.09437 0 0 .09437 3.872 3.686)"
            />
            <path
                d="M128 18.403V241.54"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${22.08 * strokeRate}px`,
                }}
                transform="matrix(0 -.09437 .09437 0 3.686 28.03)"
            />
        </svg>
    )
}