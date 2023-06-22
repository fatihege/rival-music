import Head from 'next/head'
import {useEffect, useRef, useState} from 'react'
import Slider from '@/components/slider'
import CustomScrollbar from '@/components/custom-scrollbar'
import styles from '@/styles/home.module.sass'

export default function HomePage() {
    const [items, _setItems] = useState([])
    const itemsRef = useRef(items)

    const setItems = value => {
        itemsRef.current = value
        _setItems(value)
    }

    useEffect(() => {
        for (let i = 0; i < 2; i++)
            for (let id = 1; id <= 6; id++)
                setItems([...itemsRef.current, {
                    id: id + i * 6,
                    name: id === 6 ? 'Ride The Lightning' : id === 5 ? 'Fear of the Dark (2015 Remaster)' : id === 4 ? 'Hells Bells' : id === 3 ? 'The Devil in I' : id === 2 ? 'Heaven and Hell - 2009 Remaster' : 'Seek & Destroy - Remastered',
                    artist: id === 5 ? 'Iron Maiden' : id === 4 ? 'AC/DC' : id === 3 ? 'Slipknot' : id === 2 ? 'Black Sabbath' : 'Metallica',
                    image: id === 6 ? '/album_cover_6.jpg' : id === 5 ? '/album_cover_5.jpg' : id === 4 ? '/album_cover_4.jpg' : id === 3 ? '/album_cover_3.jpg' : id === 2 ? '/album_cover_2.jpg' : '/album_cover_1.jpg',
                }])
    }, [])

    return (
        <>
            <Head>
                <title>Rival Music</title>
            </Head>
            <CustomScrollbar scrollbarPadding={4}>
                <div className={styles.container}>
                    <div className={styles.content}>
                        <h1 className={styles.pageTitle}>Listen Now</h1>
                        <Slider title="Rhythm of Sounds" items={itemsRef.current}/>
                        <Slider title="Highlights of Your Music World" items={itemsRef.current}/>
                    </div>
                </div>
            </CustomScrollbar>
        </>
    )
}
