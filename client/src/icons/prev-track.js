export default function PrevTrackIcon({stroke = '#fff', strokeRate = 1}) {
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
                d="M0 47.61a26.161 26.161 0 0 1 40.188-22.083l134.927 85.707a19.86 19.86 0 0 1 0 33.532L40.188 230.473A26.161 26.161 0 0 1 0 208.39V47.61Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${20.7 * strokeRate}px`,
                }}
                transform="matrix(-1.00655 0 0 1.00655 245.429 -.839)"
            />
            <path
                d="M239.917 34.353h-24.588a17.806 17.806 0 0 0-17.802 17.803v151.688a17.806 17.806 0 0 0 17.802 17.803h24.588"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${18.54 * strokeRate}px`,
                }}
                transform="matrix(-1.12346 0 0 1.12346 280.108 -15.803)"
            />
        </svg>
    )
}