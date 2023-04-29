import Head from 'next/head'
import Link from 'next/link'
import {useEffect, useState} from 'react'
import {ColorExtractor} from 'react-color-extractor'
import {AddIcon, CopyIcon, DownloadIcon, LikeIcon} from '@/icons'
import rgbToHsl from '@/utils/rgb-to-hsl'
import rgbToString from '@/utils/rgb-to-string'
import styles from '@/styles/track-panel.module.sass'

export default function TrackPanel({type = 'lyrics'}) {
    const [colors, setColors] = useState([]) // Colors state
    const [darkText, setDarkText] = useState(false) // Dark text state

    useEffect(() => {
        let newColors = null // Initialize new colors
        if (colors.length) newColors = colors.map(color => rgbToHsl(color)).filter((_,i) => i < 2) // Convert colors to HSL and get first two
        const averageLightness = newColors ? newColors.reduce((acc, cur) => acc + cur[2], 0) / newColors.length : 0 // Get average lightness of colors
        setDarkText(averageLightness * 100 > 50) // Set dark text state
    }, [colors])

    return (
        <>
            <Head>
                <title>Seek & Destroy - Remastered • Rival Music</title>
            </Head>
            <div className={`${styles.trackPanelContainer} ${darkText ? styles.darkText : ''}`}>
                <div className={styles.panelBackground} style={colors.length ? {backgroundImage: `radial-gradient(circle at 0 0, ${rgbToString(colors[0])}, ${rgbToString(colors[1])})`} : {}}></div>
                <div className={styles.trackVisual}>
                    <div className={styles.trackWrapper}>
                        <div className={styles.trackImage}>
                            <ColorExtractor rgb getColors={colors => setColors(colors)}>
                                <img src="/album_cover_1.jpg" alt="Album Cover"/>
                            </ColorExtractor>
                        </div>
                        <div className={styles.trackInfo}>
                            <h2 className={styles.trackName}>
                                <Link href="/">
                                    Seek & Destroy - Remastered
                                </Link>
                            </h2>
                            <h4 className={styles.trackArtist}>
                                <Link href="/">
                                    Metallica
                                </Link>
                            </h4>
                        </div>
                        <div className={styles.trackControls}>
                            <button className={styles.control}>
                                <CopyIcon stroke={darkText ? '#131313' : '#fff'}/>
                            </button>
                            <button className={styles.control}>
                                <LikeIcon stroke={darkText ? '#131313' : '#fff'}/>
                            </button>
                            <button className={styles.control}>
                                <AddIcon stroke={darkText ? '#131313' : '#fff'}/>
                            </button>
                            <button className={styles.control}>
                                <DownloadIcon stroke={darkText ? '#131313' : '#fff'}/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}