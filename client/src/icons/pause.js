export default function PauseIcon({fill = '#fff', width = null, height = null}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinejoin: "round",
                strokeMiterlimit: 2,
            }}
            viewBox="0 0 64 64"
            width={width}
            height={height}
        >
            <path
                d="M155.933 63.259c0-14.428-12.505-26.124-27.931-26.124h-.004c-15.426 0-27.931 11.696-27.931 26.124v129.482c0 14.428 12.505 26.124 27.931 26.124h.004c15.426 0 27.931-11.696 27.931-26.124V63.259Z"
                style={{
                    fill,
                }}
                transform="matrix(.32938 0 0 .35217 7.372 -13.078)"
            />
            <path
                d="M155.933 63.259c0-14.428-12.505-26.124-27.931-26.124h-.004c-15.426 0-27.931 11.696-27.931 26.124v129.482c0 14.428 12.505 26.124 27.931 26.124h.004c15.426 0 27.931-11.696 27.931-26.124V63.259Z"
                style={{
                    fill,
                }}
                transform="matrix(.32938 0 0 .35217 -27.694 -13.078)"
            />
        </svg>
    )
}