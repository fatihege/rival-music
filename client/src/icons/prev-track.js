export default function PrevTrackIcon({stroke = '#fff', strokeRate = 1, width = null, height = null}) {
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
            viewBox="0 0 64 64"
            width={width}
            height={height}
        >
            <path
                d="M0 60.825a33.423 33.423 0 0 1 51.343-28.212l116.445 73.967a25.376 25.376 0 0 1 0 42.84L51.343 223.387A33.423 33.423 0 0 1 0 195.175V60.825Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${26.44 * strokeRate}px`,
                }}
                transform="matrix(-.19696 0 0 .19696 54.979 6.789)"
            />
            <path
                d="M239.917 34.353h-19.646a22.743 22.743 0 0 0-22.744 22.744v141.806a22.743 22.743 0 0 0 22.744 22.744h19.646"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${23.7 * strokeRate}px`,
                }}
                transform="matrix(-.21984 0 0 .21984 61.765 3.86)"
            />
        </svg>
    )
}