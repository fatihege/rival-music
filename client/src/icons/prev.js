export default function PrevIcon({stroke = '#fff', strokeWidth = 32}) {
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
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="matrix(-.63955 0 0 .63955 171.163 46.137)"
            />
        </svg>
    )
}