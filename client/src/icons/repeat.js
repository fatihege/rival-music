export default function RepeatIcon({stroke = '#fff', strokeRate = 1}) {
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
                d="M86.881 169.571h-6.04c-22.959 0-41.57-18.611-41.57-41.57v-.002a41.57 41.57 0 0 1 41.57-41.57h94.318a41.57 41.57 0 0 1 41.57 41.57v.002c0 22.959-18.611 41.57-41.57 41.57H128"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${13.46 * strokeRate}px`,
                }}
                transform="translate(-10.727 -19.883) scale(1.0838)"
            />
            <path
                d="m0 0 128 128L0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${101.94 * strokeRate}px`,
                }}
                transform="matrix(-.14306 0 0 -.14306 146.312 182.211)"
            />
        </svg>
    )
}