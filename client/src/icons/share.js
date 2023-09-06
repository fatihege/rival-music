export default function ShareIcon({stroke = '#fff', strokeRate = 1}) {
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
                d="M1.21 13.017s.109 5.544.109 12.655A6.326 6.326 0 0 0 7.648 32h16.704a6.326 6.326 0 0 0 6.329-6.328c0-7.111-.109-12.655-.109-12.655"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${3.05 * strokeRate}px`,
                }}
                transform="matrix(.75808 0 0 .75808 3.87 4.281)"
            />
            <path
                d="M0 32V0h32"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${7.59 * strokeRate}px`,
                }}
                transform="scale(.30432) rotate(45 12.563 69.15)"
            />
            <path
                d="M16 9.71V16"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${1.05 * strokeRate}px`,
                }}
                transform="translate(-19.03 -17.798) scale(2.18937)"
            />
        </svg>
    )
}