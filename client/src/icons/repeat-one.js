export default function RepeatOneIcon({stroke = '#fff', fill = '#fff', strokeRate = 1}) {
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
            <g transform="translate(25.947 25.947) scale(.79729)">
                <path
                    d="M86.881 169.571h-6.04c-22.959 0-41.57-18.611-41.57-41.57v-.002a41.57 41.57 0 0 1 41.57-41.57h94.318a41.57 41.57 0 0 1 41.57 41.57v.002c0 22.959-18.611 41.57-41.57 41.57H128"
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${13.46 * strokeRate}px`,
                    }}
                    transform="translate(-45.998 -57.482) scale(1.35936)"
                />
                <path
                    d="m0 0 128 128L0 256"
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${101.94 * strokeRate}px`,
                    }}
                    transform="rotate(179.746 75.484 97.998) scale(.17944)"
                />
                <circle
                    cx={63.918}
                    cy={116.516}
                    r={30}
                    style={{
                        fill,
                    }}
                />
            </g>
        </svg>
    )
}