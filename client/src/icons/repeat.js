export default function RepeatIcon({stroke = '#fff', strokeRate = 1}) {
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
            viewBox="0 0 64 64"
        >
            <g transform="matrix(0.270951,0,0,-0.270951,-2.68169,68.9707)">
                <path
                    d="M86.881,169.571L80.841,169.571C57.882,169.571 39.271,150.96 39.271,128.001C39.271,128 39.271,128 39.271,127.999C39.271,116.974 43.651,106.4 51.446,98.604C59.242,90.808 69.816,86.429 80.841,86.429L175.159,86.429C186.184,86.429 196.758,90.808 204.554,98.604C212.349,106.4 216.729,116.974 216.729,127.999L216.729,128.001C216.729,150.96 198.118,169.571 175.159,169.571C152.086,169.571 128,169.571 128,169.571"
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${13.46 * strokeRate}px`,
                    }}
                />
                <g transform="matrix(-0.132002,2.49514e-17,-2.49514e-17,-0.132002,144.896,186.468)">
                    <path
                        d="M0,0L128,128L0,256"
                        style={{
                            fill: "none",
                            stroke,
                            strokeWidth: `${101.94 * strokeRate}px`,
                        }}
                    />
                </g>
            </g>
        </svg>
    )
}