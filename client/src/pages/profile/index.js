import {useRouter} from 'next/router'
import {useContext, useEffect} from 'react'
import {AuthContext} from '@/contexts/auth'

export default function ProfilePage() {
    const router = useRouter()
    const [user] = useContext(AuthContext) // Get user data from auth context

    useEffect(() => {
        if (user.loaded && user?.token && user?.id) router.push('/profile/[id]', `/profile/${user.id}`) // If user is logged in, redirect to their profile page
        else router.push('/') // Else redirect to home page
    }, [user])

    return <></>
}