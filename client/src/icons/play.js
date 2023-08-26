export default function PlayIcon({fill = '#fff', rounded = false}) {
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
            viewBox="0 0 64 64"
        >
            <path
                d="m0 0 205.979 128L0 256V0Z"
                style={{
                    fill,
                }}
                transform="translate(11.336) scale(.25)"
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
        >
            <path
                d="M0 26.02a14.464 14.464 0 0 1 22.1-12.286l164.108 101.98a14.465 14.465 0 0 1 0 24.572L22.1 242.266A14.464 14.464 0 0 1 0 229.98V26.02Z"
                style={{
                    fill,
                }}
                transform="translate(11.336) scale(.25)"
            />
        </svg>
    )
}