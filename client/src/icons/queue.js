export default function QueueIcon({filled = false, stroke = '#fff', strokeWidth = 14, fill = '#fff'}) {
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
                d="M208.842 71.312c0-11.071-8.975-20.046-20.046-20.046H67.204c-11.071 0-20.046 8.975-20.046 20.046h0c0 11.071 8.975 20.046 20.046 20.046h121.592c11.071 0 20.046-8.975 20.046-20.046h0Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="translate(-14.01 4.504) scale(1.10946)"
            />
            <path
                d="M47.158 122.906h161.684"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="matrix(1.02816 0 0 1.10946 -3.604 58.26)"
            />
            <path
                d="M47.158 122.906h161.684"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="matrix(1.02816 0 0 1.10946 -3.604 13.881)"
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
                d="M208.842 71.312c0-11.071-8.975-20.046-20.046-20.046H67.204c-11.071 0-20.046 8.975-20.046 20.046h0c0 11.071 8.975 20.046 20.046 20.046h121.592c11.071 0 20.046-8.975 20.046-20.046h0Z"
                style={{
                    fill,
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="translate(-14.01 4.504) scale(1.10946)"
            />
            <path
                d="M47.158 122.906h161.684"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="matrix(1.02816 0 0 1.10946 -3.604 58.26)"
            />
            <path
                d="M47.158 122.906h161.684"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="matrix(1.02816 0 0 1.10946 -3.604 13.881)"
            />
        </svg>
    )
}