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
                d="M172.792 136.186c0-3.527-1.046-6.908-2.908-9.402-1.862-2.493-4.388-3.894-7.021-3.894H76.739c-2.634 0-5.159 1.401-7.021 3.894-1.862 2.494-2.908 5.875-2.908 9.402v79.39c0 3.526 1.046 6.908 2.908 9.402 1.862 2.493 4.387 3.894 7.021 3.894h86.124c2.633 0 5.159-1.401 7.021-3.894 1.862-2.494 2.908-5.876 2.908-9.402v-79.39Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "8.2px",
                }}
                transform="matrix(2.0143 0 0 1.50423 -113.314 -95.938)"
            />
            <path
                d="M52.416 90.804h151.168"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "13.27px",
                }}
                transform="translate(-12.68 -51.763) scale(1.09906)"
            />
            <path
                d="M52.416 90.804h151.168"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "16.64px",
                }}
                transform="matrix(.92714 0 0 .82276 9.326 -67.049)"
            />
            <circle
                cx={128}
                cy={176.197}
                r={18.338}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "7.49px",
                }}
                transform="matrix(1.94604 0 0 1.94604 -121.093 -174.258)"
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
                d="M52.416 90.804h151.168"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "13.27px",
                }}
                transform="translate(-12.68 -51.763) scale(1.09906)"
            />
            <path
                d="M52.416 90.804h151.168"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "16.64px",
                }}
                transform="matrix(.92714 0 0 .82276 9.326 -67.049)"
            />
            <path
                d="M234.74 108.917a20 20 0 0 0-20-20H41.26a20.004 20.004 0 0 0-20 20V228.34a20 20 0 0 0 20 20h173.48a20.004 20.004 0 0 0 20-20V108.917ZM128 125.651c-23.72 0-42.977 19.258-42.977 42.978 0 23.719 19.257 42.977 42.977 42.977 23.72 0 42.977-19.258 42.977-42.977 0-23.72-19.257-42.978-42.977-42.978Z"
                style={{
                    fill,
                    stroke,
                    strokeWidth: "14.58px",
                }}
            />
        </svg>
    )
}