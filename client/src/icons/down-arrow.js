export default function DownArrowIcon({stroke = '#fff', strokeRate = 1}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinecap: "round",
                strokeMiterlimit: 1.5,
            }}
            viewBox="0 0 64 64"
        >
            <g transform="matrix(9.79034e-18,0.159888,-0.159888,9.79034e-18,52.4657,21.2094)">
                <path
                    d="M0,0L134.977,128L0,256"
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${32.57 * strokeRate}px`,
                    }}
                />
            </g>
        </svg>
    )
}