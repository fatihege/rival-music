export default function VolumeMuteIcon({stroke = '#fff'}) {
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
                d="M127.878 49.13h-12.285c-16.153 0-29.246 13.094-29.246 29.246v.003c0 16.152 13.093 29.246 29.246 29.246h12.285l17.345 13.986a15.009 15.009 0 0 0 24.43-11.685V46.829a15.01 15.01 0 0 0-24.43-11.685L127.878 49.13Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "8.2px",
                }}
                transform="matrix(1.7789 0 0 1.7789 -146.118 -11.427)"
            />
            <path
                d="m201.612 103.517-33.191 33.192"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "11.88px",
                }}
                transform="matrix(1.22772 0 0 1.22772 -25.373 -19.465)"
            />
            <path
                d="m201.612 103.517-33.191 33.192"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "11.88px",
                }}
                transform="rotate(-90 204.73 150.418) scale(1.22772)"
            />
        </svg>
    )
}