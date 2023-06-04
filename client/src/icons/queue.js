export default function QueueIcon({filled = false, stroke = '#fff', strokeRate = 1, fill = '#fff'}) {
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
            viewBox="0 0 64 64"
        >
            <path
                d="M208.842 71.307c0-11.069-11.241-20.041-25.108-20.041H72.266c-13.867 0-25.108 8.972-25.108 20.041v.01c0 11.068 11.241 20.041 25.108 20.041h111.468c13.867 0 25.108-8.973 25.108-20.041v-.01Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${11.6 * strokeRate}px`,
                }}
                transform="matrix(.27736 0 0 .34749 -3.503 -6.375)"
            />
            <path
                d="M47.158 122.906h161.684"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${13.63 * strokeRate}px`,
                }}
                transform="matrix(.25704 0 0 .27736 -.901 18.47)"
            />
            <path
                d="M47.158 122.906h161.684"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${13.63 * strokeRate}px`,
                }}
                transform="matrix(.25704 0 0 .27736 -.901 4.876)"
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
            viewBox="0 0 64 64"
        >
            <path
                d="M208.842 71.307c0-11.069-11.241-20.041-25.108-20.041H72.266c-13.867 0-25.108 8.972-25.108 20.041v.01c0 11.068 11.241 20.041 25.108 20.041h111.468c13.867 0 25.108-8.973 25.108-20.041v-.01Z"
                style={{
                    fill,
                    stroke,
                    strokeWidth: `${11.6 * strokeRate}px`,
                }}
                transform="matrix(.27736 0 0 .34749 -3.503 -6.375)"
            />
            <path
                d="M47.158 122.906h161.684"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${13.63 * strokeRate}px`,
                }}
                transform="matrix(.25704 0 0 .27736 -.901 18.47)"
            />
            <path
                d="M47.158 122.906h161.684"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${13.63 * strokeRate}px`,
                }}
                transform="matrix(.25704 0 0 .27736 -.901 4.876)"
            />
        </svg>
    )
}