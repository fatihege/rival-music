export default function ShuffleIcon({stroke = '#fff'}) {
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
                d="m199.774 199.774-59.003-59.003"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "8.89px",
                }}
                transform="matrix(1.64092 0 0 1.64092 -79.883 -79.883)"
            />
            <path
                d="m199.774 199.774-59.003-59.003"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "8.89px",
                }}
                transform="matrix(1.64092 0 0 1.64092 -222.925 -222.925)"
            />
            <path
                d="M256 0 0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "15.56px",
                }}
                transform="translate(8.069 8.069) scale(.93696)"
            />
            <path
                d="m0 0 128 128L0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "66.21px",
                }}
                transform="matrix(.15574 -.15574 .15574 .15574 208.06 8.069)"
            />
            <path
                d="m0 0 128 128L0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: "66.21px",
                }}
                transform="matrix(-.15574 .15574 -.15574 -.15574 47.94 247.93)"
            />
        </svg>
    )
}