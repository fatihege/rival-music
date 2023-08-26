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
            viewBox="0 0 64 64"
        >
            <path
                d="M35.804 46.522 32 52.589l-3.804-6.067V18.273c0-2.1 1.703-3.803 3.803-3.803h.002c2.1 0 3.803 1.703 3.803 3.803v28.249Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${2.67 * strokeRate}px`,
                }}
                transform="rotate(45 56.715 23.912) scale(1.40494)"
            />
        </svg>
    )
}