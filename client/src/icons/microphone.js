export default function MicrophoneIcon({stroke = '#fff', strokeRate = 1, width = null, height = null}) {
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
            width={width}
            height={height}
        >
            <circle
                cx={128}
                cy={95.163}
                r={30.632}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${10 * strokeRate}px`,
                }}
                transform="rotate(-30 22.995 284.299) scale(1.52967)"
            />
            <path
                d="M107.573 120.509A32.414 32.414 0 0 0 128 127.721a32.414 32.414 0 0 0 20.426-7.211c-1.521 24.205-3.738 59.436-4.816 76.377a13.893 13.893 0 0 1-12.477 12.952 38.316 38.316 0 0 1-6.15.069 13.916 13.916 0 0 1-12.615-12.987l-4.795-76.412Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${10 * strokeRate}px`,
                }}
                transform="rotate(-30 33.276 258.372) scale(1.43916)"
            />
        </svg>
    )
}