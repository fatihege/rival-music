import Head from 'next/head'
import Link from 'next/link'
import {useEffect, useState} from 'react'
import {prominent} from 'color.js'
import {AddIcon, CopyIcon, DownloadIcon, LikeIcon} from '@/icons'
import rgbToHsl from '@/utils/rgb-to-hsl'
import rgbToString from '@/utils/rgb-to-string'
import styles from '@/styles/track-panel.module.sass'

export default function TrackPanel({type = 'lyrics'}) {
    const [color, setColor] = useState(null) // Colors state
    const [darkText, setDarkText] = useState(false) // Dark text state

    useEffect(() => {
        (async () => {
            const colors = await prominent('/album_cover_1.jpg', {amount: 2, group: 20}) // Extract 2 prominent colors from the album cover
            setColor(colors[1]) // Update color state to 2nd prominent color
            setDarkText(rgbToHsl(colors[1])[2] >= .5) // Set dark text state to true if prominent color lightness equal or greater than 50
        })()
    }, [])

    return (
        <>
            <Head>
                <title>Seek & Destroy - Remastered • Rival Music</title>
            </Head>
            <div className={`${styles.trackPanelContainer} ${darkText ? styles.darkText : ''}`}>
                <div className={styles.panelBackground} style={color ? {backgroundColor: `${rgbToString(color)}`} : {}}></div>
                <div className={styles.trackVisual}>
                    <div className={styles.trackWrapper}>
                        <div className={styles.trackImage}>
                            <img src="/album_cover_1.jpg" alt="Album Cover"/>
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
                                <AddIcon strokeWidth={24} stroke={darkText ? '#131313' : '#fff'}/>
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