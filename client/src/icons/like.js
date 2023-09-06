export default function LikeIcon({stroke = '#fff', strokeRate = 1,  fill = 'none'}) {
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
                d="M135.065 99.048c19.686-19.483 40.37-17.877 53.826-5.817 13.457 12.061 13.457 36.182 0 60.303-8.666 16.643-29.859 33.286-48.911 45.234a9.299 9.299 0 0 1-9.829 0c-19.052-11.948-40.245-28.591-48.911-45.234-13.456-24.121-13.456-48.242 0-60.303 13.456-12.06 34.14-13.666 53.825 5.817Z"
                style={{
                    fill,
                    stroke,
                    strokeWidth: `${10.5 * strokeRate}px`,
                }}
                transform="matrix(.17273 0 0 .17453 -7.33 -8.835)"
            />
        </svg>
    )
}