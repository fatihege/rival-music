export default function DownArrowIcon({stroke = '#fff', strokeRate = 1}) {
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
            viewBox="0 0 32 32"
        >
            <path
                d="m0 0 134.977 128L0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${32.57 * strokeRate}px`,
                }}
                transform="matrix(0 .07994 -.07994 0 26.233 10.605)"
            />
        </svg>
    )
}