export default function RepeatOneIcon({stroke = '#fff', strokeRate = 1}) {
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
                d="M80.841 169.571c-22.959 0-41.57-18.611-41.57-41.57v-.002a41.57 41.57 0 0 1 41.57-41.57h94.318a41.57 41.57 0 0 1 41.57 41.57v.002c0 22.959-18.611 41.57-41.57 41.57H153.09"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${13.46 * strokeRate}px`,
                }}
                transform="matrix(1.0838 0 0 1.0838 -10.727 -19.883)"
            />
            <path
                d="m0 0 128 128L0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${101.94 * strokeRate}px`,
                }}
                transform="matrix(-.14306 0 0 -.14306 172.745 182.212)"
            />
            <path
                d="m85.807 203.268 4.984-4.984v24.31"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${6.18 * strokeRate}px`,
                }}
                transform="matrix(2.7988 0 0 1.81922 -133.661 -220.814)"
            />
        </svg>
    )
}