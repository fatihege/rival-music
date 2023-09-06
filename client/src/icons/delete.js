export default function DeleteIcon({stroke = '#fff', strokeRate = 1}) {
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
                d="M42.336 23.318H21.499l3.046 17.843a3.003 3.003 0 0 0 2.961 2.498h8.823a3.004 3.004 0 0 0 2.961-2.498l3.046-17.843Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${2.3 * strokeRate}px`,
                }}
                transform="matrix(.90406 0 0 .90406 -12.855 -11.618)"
            />
            <path
                d="M21.581 25.815h20.838"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${2.07 * strokeRate}px`,
                }}
                transform="matrix(1.09922 0 0 .90406 -19.175 -13.876)"
            />
            <path
                d="M27.101 25.815A4.983 4.983 0 0 1 32 19.936a4.983 4.983 0 0 1 4.899 5.879h-9.798Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${2.3 * strokeRate}px`,
                }}
                transform="matrix(.90406 0 0 .90406 -12.93 -13.876)"
            />
        </svg>
    )
}