export default function ExplicitIcon({fill = '#eee'}) {
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
            viewBox="0 0 64 64"
        >
            <path
                d="M64 7.938v48.124A7.938 7.938 0 0 1 56.062 64H7.938A7.938 7.938 0 0 1 0 56.062V7.938A7.938 7.938 0 0 1 7.938 0h48.124A7.938 7.938 0 0 1 64 7.938Zm-15.359 7.421H15.359v33.282h33.282v-6.408H21.767v-7.029h26.874v-6.408H21.767v-7.029h26.874v-6.408Z"
                style={{
                    fill,
                }}
            />
        </svg>
    )
}