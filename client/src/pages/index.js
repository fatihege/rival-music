import Head from 'next/head'
import Slider from '@/components/slider'
import styles from '@/styles/home.module.sass'

export default function HomePage() {
    const ALBUM_IMAGE = '/album_cover_6.jpg'

    return (
        <>
            <Head>
                <title>Rival Music</title>
            </Head>
            <div className={styles.container}>
                <div className={styles.blurryBackground}>
                    <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" width="100%" height="100%">
                        <filter id="displacementFilter">
                            <feTurbulence type="turbulence" baseFrequency=".01 .01"
                                          numOctaves="4" result="turbulence" seed="10"/>
                            <feDisplacementMap in2="turbulence" in="SourceGraphic"
                                               scale="60" xChannelSelector="R" yChannelSelector="B"/>
                        </filter>
                        <image href={ALBUM_IMAGE} width="110%" height="115%" x="-30" y="-30" preserveAspectRatio="none"
                               filter="url(#displacementFilter)"/>
                    </svg>
                    <div className={styles.blur}></div>
                    <div className={styles.overlay}></div>
                </div>
                <div className={styles.content}>
                    <Slider title="Rhythm of Sounds"/>
                    <Slider title="Highlights of Your Music World"/>
                </div>
            </div>
        </>
    )
}
