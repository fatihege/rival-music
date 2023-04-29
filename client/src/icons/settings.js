export default function SettingsIcon({stroke = '#fff', strokeRate = 1}) {
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
                d="M122.56 63.854a10.883 10.883 0 0 1 10.88 0l47.392 27.362a10.88 10.88 0 0 1 5.44 9.422v54.724a10.88 10.88 0 0 1-5.44 9.422l-47.392 27.362a10.883 10.883 0 0 1-10.88 0l-47.392-27.362a10.88 10.88 0 0 1-5.44-9.422v-54.724a10.88 10.88 0 0 1 5.44-9.422l47.392-27.362Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${7.93 * strokeRate}px`,
                }}
                transform="translate(-107.303 -107.303) scale(1.8383)"
            />
            <circle
                cx={128}
                cy={128}
                r={36.693}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${16.96 * strokeRate}px`,
                }}
                transform="matrix(.86006 0 0 .86006 17.912 17.912)"
            />
        </svg>
    )
}