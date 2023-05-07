export default function PlayIcon({fill = '#fff'}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinejoin: "round",
                strokeMiterlimit: 2,
            }}
            viewBox="0 0 256 256"
        >
            <path
                d="m0 0 205.979 128L0 256V0Z"
                style={{
                    fill,
                }}
                transform="translate(45.344)"
            />
        </svg>
    )
}