export default function PlayIcon({fill = '#fff', rounded = false, width = null, height = null}) {
    return !rounded ? (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinejoin: "round",
                strokeMiterlimit: 2,
            }}
            viewBox="0 0 32 32"
            width={width}
            height={height}
        >
            <path
                d="m0 0 205.979 128L0 256V0Z"
                style={{
                    fill,
                }}
                transform="translate(5.668) scale(.125)"
            />
        </svg>
    ) : (
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
                d="M0 34.662a19.27 19.27 0 0 1 29.441-16.367l150.2 93.338a19.27 19.27 0 0 1 0 32.734l-150.2 93.338A19.27 19.27 0 0 1 0 221.338V34.662Z"
                style={{
                    fill,
                }}
                transform="matrix(.25 0 0 .25 8.408 0)"
            />
        </svg>
    )
}