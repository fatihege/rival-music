export default function ShuffleIcon({stroke = '#fff', strokeRate = 1}) {
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
                d="M12.549 8.366c11.462 6.336 23.252 6.927 35.373 1.686a2.516 2.516 0 0 1 3.52 2.307c.009 2.531.009 5.329.009 5.329"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${3.47 * strokeRate}px`,
                }}
                transform="matrix(.53985 0 0 .53985 -1.275 4.997)"
            />
            <path
                d="M12.549 17.688v-5.252a2.526 2.526 0 0 1 3.561-2.302c11.453 5.126 23.233 4.562 35.341-1.768"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${3.47 * strokeRate}px`,
                }}
                transform="matrix(.53985 0 0 -.53985 -1.275 27.203)"
            />
        </svg>
    )
}