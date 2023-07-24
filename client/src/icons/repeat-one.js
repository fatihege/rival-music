export default function RepeatOneIcon({stroke = '#fff', strokeRate = 1}) {
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
            <g transform="matrix(0.199322,0,0,-0.199322,6.48672,57.9935)">
                <g transform="matrix(1.35936,0,0,1.35936,-45.9979,-57.4819)">
                    <path
                        d="M80.841,169.571C57.882,169.571 39.271,150.96 39.271,128.001C39.271,128 39.271,128 39.271,127.999C39.271,116.974 43.651,106.4 51.446,98.604C59.242,90.808 69.816,86.429 80.841,86.429L175.159,86.429C186.184,86.429 196.758,90.808 204.554,98.604C212.349,106.4 216.729,116.974 216.729,127.999L216.729,128.001C216.729,150.96 198.118,169.571 175.159,169.571C152.086,169.571 153.09,169.571 153.09,169.571"
                        style={{
                            fill: "none",
                            stroke,
                            strokeWidth: `${13.46 * strokeRate}px`,
                        }}
                    />
                    <g transform="matrix(-0.132002,2.49514e-17,-2.49514e-17,-0.132002,169.285,186.468)">
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
                <g transform="matrix(3.5104,0,0,-2.28175,-200.188,650.838)">
                    <path
                        d="M85.807,203.268L90.791,198.284L90.791,222.594"
                        style={{
                            fill: "none",
                            stroke,
                            strokeWidth: `${6.18 * strokeRate}px`,
                        }}
                    />
                </g>
            </g>
        </svg>
    )
}