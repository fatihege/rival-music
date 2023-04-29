export default function CopyIcon({stroke = '#fff', strokeWidth = 15}) {
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
                d="M173.241 69.788c0-11.045-8.954-20-20-20h-50.482c-11.046 0-20 8.955-20 20v116.424c0 11.045 8.954 20 20 20h50.482c11.046 0 20-8.955 20-20V69.788Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="translate(-15.302 -15.302)"
            />
            <path
                d="M173.241 80.392v105.82c0 11.045-8.954 20-20 20h-39.878v.001a30.602 30.602 0 0 0 30.602 30.602h27.748c17.746 0 32.131-14.386 32.131-32.131v-93.69a30.602 30.602 0 0 0-30.602-30.602h-.001Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${strokeWidth}px`,
                }}
                transform="translate(-15.302 -15.302)"
            />
        </svg>
    )
}