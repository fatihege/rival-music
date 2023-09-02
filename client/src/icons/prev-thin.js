export default function PrevThinIcon({stroke = '#fff', strokeRate = 1}) {
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
            viewBox="0 0 64 128"
        >
            <path
                d="m0 0 64 64-64 64"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${5.02 * strokeRate}px`,
                }}
                transform="matrix(-.82946 0 0 .82946 58.543 10.915)"
            />
        </svg>
    )
}