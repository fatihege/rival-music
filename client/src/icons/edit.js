export default function EditIcon({stroke = '#fff', strokeRate = 1}) {
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
                d="M35.804 46.522 32 52.589l-3.804-6.067V18.271a3.801 3.801 0 0 1 3.801-3.801h.006a3.801 3.801 0 0 1 3.801 3.801v28.251Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${2.67}px`,
                }}
                transform="rotate(45 28.357 11.956) scale(.70247)"
            />
        </svg>
    )
}