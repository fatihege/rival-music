import {Html, Head, Main, NextScript} from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <meta name="description" content="Rival is a modern and up-to-date music streaming platform."/>
                <meta name="theme-color" content="#00ff78"/>
                <meta name="author" content="Fatih EGE"/>
                <meta name="keywords" content="rival,music,streaming,platform"/>
                <meta name="robots" content="index,follow"/>
                <meta name="googlebot" content="index,follow"/>
                <meta name="google" content="notranslate"/>
                <meta name="og:title" content="Rival Music — Listen what you want"/>
                <meta name="og:description" content="Rival is a modern and up-to-date music streaming platform."/>
                <meta name="og:type" content="website"/>
                <meta name="og:url" content={process.env.APP_URL}/>
                <meta name="og:site_name" content="Rival Music"/>
                <meta name="og:image" content={`/banner.png`}/>
                <meta name="og:image:secure_url" content={`/banner.png`}/>
                <meta name="og:image:alt" content="Rival Music"/>
                <meta name="og:image:type" content="image/png"/>
                <meta name="og:image:width" content="1920"/>
                <meta name="og:image:height" content="1080"/>
                <meta name="twitter:card" content="summary_large_image"/>
                <meta name="twitter:title" content="Rival Music — Listen what you want"/>
                <meta name="twitter:description" content="Rival is a modern and up-to-date music streaming platform."/>
                <meta name="twitter:image" content={`/banner.png`}/>
                <meta name="twitter:image:alt" content="Rival Music"/>
                <meta name="twitter:image:width" content="1920"/>
                <meta name="twitter:image:height" content="1080"/>
                <meta name="twitter:domain" content={process.env.APP_URL.split('://')[1]}/>
                <link rel="icon" href={`/favicon.ico`}/>
            </Head>
            <body suppressHydrationWarning={true}>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    )
}