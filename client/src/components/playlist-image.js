import Skeleton from 'react-loading-skeleton'
import Image from '@/components/image'
import {AlbumDefault} from '@/icons'
import styles from '@/styles/playlist.module.sass'

export default function PlaylistImage({playlist, width = null, height = null, className = ''}) {
    return (
        playlist?.image ? (
            <Image src={playlist?.image || '0'} width={width || 300} height={height || 300} format={'webp'} alternative={<AlbumDefault/>} loading={<Skeleton style={{top: '-3px'}} height={height || 300}/>}/>
        ) : playlist?.covers?.length ? (
            <div className={`${styles.covers} ${playlist?.covers?.length < 4 ? styles.single : ''} ${className}`}>
                {playlist?.covers?.length < 4 ? (
                    <Image src={playlist.covers[0] || '0'} width={width || 300} height={height || 300} format={'webp'} loading={<Skeleton style={{top: '-3px'}} borderRadius={0} height={height || 300}/>}/>
                ) : playlist?.covers?.filter((_, i) => i < 4)?.map((cover, index) => (
                    <Image key={index} src={cover || '0'} width={width ? width / 2 : 150} height={height ? height / 2 : 150} format={'webp'} loading={<Skeleton style={index > 1 ? {top: '-6px'} : {top: '-3px'}} borderRadius={0} height={height ? height / 2 + 10 : 150}/>}/>
                ))}
            </div>
        ) : (
            <AlbumDefault/>
        )
    )
}