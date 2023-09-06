export default function LeftArrowIcon({stroke = '#fff', strokeRate = 1}) {
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
            viewBox="0 0 32 32"
        >
            <path
                d="m0 0 178.742 121.097a8.34 8.34 0 0 1 0 13.806L0 256"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${32.57 * strokeRate}px`,
                }}
                transform="matrix(.07994 0 0 .07994 9.698 5.767)"
            />
        </svg>
    )
}