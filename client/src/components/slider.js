import Link from 'next/link'
import SpanLink from '@/components/span-link'
import {NextIcon, PrevIcon} from '@/icons'
import styles from '@/styles/slider.module.sass'

export default function Slider({title, items}) {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.title}>
                    {title}
                </div>
                <div className={styles.controls}>
                    <button className={styles.control}>
                        <PrevIcon stroke="#b4b4b4" strokeWidth={20}/>
                    </button>
                    <button className={styles.control}>
                        <NextIcon stroke="#b4b4b4" strokeWidth={20}/>
                    </button>
                    <Link href="/" className={styles.control}>View all</Link>
                </div>
            </div>
            <div className={styles.wrapper}>
                <SpanLink href="/" className={styles.item}>
                    <div className={styles.itemImage}>
                        <img src="/album_cover_1.jpg" alt=""/>
                    </div>
                    <div className={styles.itemInfo}>
                        <div className={styles.itemName}>
                            Seek & Destroy - Remastered
                        </div>
                        <div className={styles.itemArtist}>
                            <SpanLink href="/">
                                Metallica
                            </SpanLink>
                        </div>
                    </div>
                </SpanLink>

                <SpanLink href="/" className={styles.item}>
                    <div className={styles.itemImage}>
                        <img src="/album_cover_2.jpg" alt=""/>
                    </div>
                    <div className={styles.itemInfo}>
                        <div className={styles.itemName}>
                            Heaven and Hell - 2009 Remastered
                        </div>
                        <div className={styles.itemArtist}>
                            <SpanLink href="/">
                                Black Sabbath
                            </SpanLink>
                        </div>
                    </div>
                </SpanLink>

                <SpanLink href="/" className={styles.item}>
                    <div className={styles.itemImage}>
                        <img src="/album_cover_3.jpg" alt=""/>
                    </div>
                    <div className={styles.itemInfo}>
                        <div className={styles.itemName}>
                            The Devil in I
                        </div>
                        <div className={styles.itemArtist}>
                            <SpanLink href="/">
                                Slipknot
                            </SpanLink>
                        </div>
                    </div>
                </SpanLink>
            </div>
        </div>
    )
}