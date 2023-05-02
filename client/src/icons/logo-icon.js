export default function LogoIcon({fill = '#fff', onClick = () => {}}) {
    return (
        <svg
            onClick={onClick}
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
                d="M128 0C57.355 0 0 57.355 0 128c0 70.645 57.355 128 128 128 70.645 0 128-57.355 128-128C256 57.355 198.645 0 128 0Zm14.665 120.486c-21.418-15.027-35.434-39.914-35.434-68.047h15.031c0 37.554 30.489 68.044 68.044 68.044v15.031h-76.971c21.418 15.027 35.434 39.914 35.434 68.047h-15.031c0-37.554-30.489-68.044-68.044-68.044v-15.031h76.971Z"
                style={{
                    fill,
                }}
            />
        </svg>
    )
}