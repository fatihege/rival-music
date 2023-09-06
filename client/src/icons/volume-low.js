export default function VolumeLowIcon({stroke = '#fff', strokeRate = 1}) {
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
            viewBox="0 0 32 32"
        >
            <path
                d="M127.878 49.13h-12.285c-16.153 0-29.246 13.094-29.246 29.246v.003c0 16.152 13.093 29.246 29.246 29.246h12.285l17.345 13.986a15.009 15.009 0 0 0 24.43-11.685V46.829a15.01 15.01 0 0 0-24.43-11.685L127.878 49.13Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${8.2 * strokeRate}px`,
                }}
                transform="matrix(.22236 0 0 .22236 -18.265 -1.428)"
            />
            <path
                d="M159.466 108.118h.002A19.882 19.882 0 0 1 179.35 128h0a19.882 19.882 0 0 1-19.882 19.882h-.002"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${13.03 * strokeRate}px`,
                }}
                transform="matrix(.13995 0 0 .13995 .249 -1.914)"
            />
        </svg>
    )
}