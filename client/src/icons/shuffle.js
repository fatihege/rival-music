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
            viewBox="0 0 64 64"
        >
            <g transform="matrix(1.07971,0,0,1.07971,-2.55064,-2.56658)">
                <g transform="matrix(1,0,0,1,-1.42109e-14,11.6342)">
                    <path
                        d="M12.549,8.366C24.011,14.702 35.801,15.293 47.922,10.052C48.7,9.713 49.596,9.79 50.306,10.255C51.015,10.72 51.442,11.511 51.442,12.359C51.451,14.89 51.451,17.688 51.451,17.688"
                        style={{
                            fill: 'none',
                            stroke,
                            strokeWidth: `${3.47 * strokeRate}px`,
                        }}
                    />
                </g>
                <g transform="matrix(1,0,0,-1,-1.42109e-14,52.7659)">
                    <path
                        d="M12.549,17.688L12.549,12.436C12.549,11.58 12.984,10.781 13.703,10.316C14.423,9.851 15.329,9.783 16.11,10.134C27.563,15.26 39.343,14.696 51.451,8.366"
                        style={{
                            fill: 'none',
                            stroke,
                            strokeWidth: `${3.47 * strokeRate}px`,
                        }}
                    />
                </g>
            </g>
        </svg>
    )
}