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
                d="M128 0c70.645 0 128 57.355 128 128 0 70.645-57.355 128-128 128C57.355 256 0 198.645 0 128 0 57.355 57.355 0 128 0Zm0 169.138A83.482 83.482 0 0 0 86.93 128 83.482 83.482 0 0 0 128 86.862h-16.924c-11.828 20.111-33.696 33.621-58.694 33.621v15.034c24.998 0 46.866 13.51 58.694 33.621H128Zm0-82.276A83.482 83.482 0 0 0 169.07 128 83.482 83.482 0 0 0 128 169.138h16.924c11.828-20.111 33.696-33.621 58.694-33.621v-15.034c-24.998 0-46.866-13.51-58.694-33.621H128Z"
                style={{
                    fill,
                }}
            />
        </svg>
    )
}