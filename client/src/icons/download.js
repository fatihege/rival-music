export default function DownloadIcon({stroke = '#fff', strokeRate = 1}) {
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
                d="M256 0H0v256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${36.42 * strokeRate}px`,
                }}
                transform="scale(-.40045) rotate(45 460.767 -642.89)"
            />
            <path
                d="M128 195.232V50.773"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${13.53 * strokeRate}px`,
                }}
                transform="translate(-10.01 -4.621) scale(1.0782)"
            />
        </svg>
    )
}