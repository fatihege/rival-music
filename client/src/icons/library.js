export default function LibraryIcon({filled = false, stroke = '#fff', fill = '#fff'}) {
    return !filled ? (
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
                d="M206.446 42.903c0-11.045-8.955-20-20-20H148c-11.046 0-20 8.955-20 20v170.194c0 11.045 8.954 20 20 20h38.446c11.045 0 20-8.955 20-20V42.903Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "14.58px",
                }}
                transform="translate(10.777)"
            />
            <path
                d="M89.308 22.903v210.194"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "14.58px",
                }}
                transform="translate(-.531)"
            />
            <path
                d="M89.308 22.903v210.194"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "14.58px",
                }}
                transform="translate(-50.531)"
            />
        </svg>
    ) : (
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
                d="M206.446 42.903c0-11.045-8.955-20-20-20H148c-11.046 0-20 8.955-20 20v170.194c0 11.045 8.954 20 20 20h38.446c11.045 0 20-8.955 20-20V42.903Z"
                style={{
                    fill,
                    stroke,
                    strokeWidth: "14.58px",
                }}
                transform="translate(10.777)"
            />
            <path
                d="M89.308 22.903v210.194"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "14.58px",
                }}
                transform="translate(-.531)"
            />
            <path
                d="M89.308 22.903v210.194"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "14.58px",
                }}
                transform="translate(-50.531)"
            />
        </svg>
    )
}