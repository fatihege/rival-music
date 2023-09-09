import axios from 'axios'
import Head from 'next/head'
import {useRouter} from 'next/router'
import Link from '@/components/link'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {DialogueContext} from '@/contexts/dialogue'
import Input from '@/components/form/input'
import {AddIcon, CloseIcon, DeleteIcon} from '@/icons'
import styles from '@/styles/admin/view-artists-and-users.module.sass'

export default function ViewUsersPage() {
    const LIMIT = 66 // Limit of users per request
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get the user state from the auth context
    const [sorting, _setSorting] = useState('last-created') // Sorting state
    const [users, _setUsers] = useState([]) // Users state
    const [, setAlert] = useContext(AlertContext) // Get the alert state from the alert context
    const [, setDialogue] = useContext(DialogueContext) // Get the dialogue state from the dialogue context
    const [loading, setLoading] = useState(false) // Loading state
    const [search, setSearch] = useState('')
    const cursorRef = useRef(0) // Cursor state
    const sortingRef = useRef(sorting) // Sorting ref
    const usersRef = useRef(users) // Users ref
    const contentRef = useRef()

    const setSorting = value => { // Set sorting state
        sortingRef.current = value
        _setSorting(value)
    }

    const setUsers = value => { // Set users state
        usersRef.current = value
        _setUsers(value)
    }

    const getUsers = async (fromZero = false) => {
        setLoading(true)
        if (fromZero) cursorRef.current = 0 // If fromZero is true, set cursor to 0

        try {
            const response = await axios.get(`${process.env.API_URL}/user/all${search?.trim()?.length ? `?query=${search.trim()}` : `?cursor=${cursorRef.current}&limit=${LIMIT}&sorting=${sortingRef.current}`}`) // Get users from API

            if (response.data?.status === 'OK' && response.data?.users) { // If response is OK
                setUsers(fromZero ? response.data?.users : [...usersRef.current, ...response.data?.users]) // Set users state
                cursorRef.current += response.data?.users?.length || 0 // Increase cursor
            }
        } catch (e) { // If an error occurred
            console.error(e)
            setAlert({ // Set alert state
                active: true,
                title: 'Error occurred while retrieving data.',
                description: 'An error occurred while retrieving data. Please try again later.',
                button: 'OK',
                type: '',
            })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { // On user state change
        if (user?.loaded && !user?.admin) router.push('/404') // If the user is not an admin, redirect to 404 page
        if (user?.loaded && user?.id && user?.token && user?.admin) getUsers() // If the user is an admin, get users from API
    }, [user])

    useEffect(() => { // On sorting state change
        if (user?.loaded && user?.token && user?.id && user?.admin) getUsers(true) // If the user is an admin, get users from API
    }, [sorting])

    useEffect(() => { // On search state change
        if (user?.loaded && user?.token && user?.id && user?.admin) getUsers(true) // If the user is an admin, get users from API
    }, [search])

    useEffect(() => {
        if (!contentRef.current) return // If contentRef is not defined, return

        const handleScroll = () => { // Add scroll event listener
            if (search?.trim()?.length) return // If there is a search query, return
            if (contentRef.current.scrollTop + contentRef.current.clientHeight >= contentRef.current.scrollHeight) getUsers() // If the user scrolled to the bottom of the page, get users from API
        }

        contentRef.current.addEventListener('scroll', handleScroll)

        return () => { // Remove scroll event listener
            if (contentRef.current) contentRef.current.removeEventListener('scroll', handleScroll)
        }
    }, [contentRef.current])

    const showDeleteDialogue = (e, userId) => {
        e.preventDefault() // Prevent default event
        e.stopPropagation() // Stop event propagation

        if (usersRef.current.find(a => a?._id === userId)?.admin) return // If the user is an admin, return

        setDialogue({
            active: true,
            title: 'Delete User',
            description: 'Are you sure you want to delete this user?',
            button: 'Delete User',
            type: 'danger',
            callback: () => { // On dialogue button click
                try {
                    axios.delete(`${process.env.API_URL}/admin/user/${userId}`, { // Delete user from API
                        headers: {
                            Authorization: `Bearer ${user?.token}`,
                        },
                    })
                    setUsers(usersRef.current.filter(a => a?._id !== userId)) // Remove user from users state
                } catch (e) { // If an error occurred
                    console.error(e) // Log error to console
                    setAlert({ // Set alert state
                        active: true,
                        title: 'Error occurred while deleting user.',
                        description: 'An error occurred while deleting user. Please try again later.',
                        button: 'OK',
                        type: '',
                    })
                }
            }
        })
    }

    const showAcceptDialogue = (e, userId) => {
        e.preventDefault() // Prevent default event
        e.stopPropagation() // Stop event propagation

        if (usersRef.current.find(a => a?._id === userId)?.admin) return // If the user is an admin, return
        const accepted = usersRef.current.find(a => a?._id === userId)?.accepted

        setDialogue({
            active: true,
            title: accepted ? 'Reject User' : 'Accept User',
            description: accepted ? 'Are you sure you want to reject this user?' : 'Are you sure you want to accept this user?',
            button: accepted ? 'Reject User' : 'Accept User',
            type: accepted ? 'danger' : '',
            callback: () => { // On dialogue button click
                try {
                    axios.post(`${process.env.API_URL}/admin/accept/${userId}`, {
                        accepted: !accepted,
                    }, { // Accept user
                        headers: {
                            Authorization: `Bearer ${user?.token}`,
                        },
                    })
                    setUsers(usersRef.current.map(a => a?._id === userId ? {...a, accepted: !accepted} : a)) // Update user in users state
                } catch (e) { // If an error occurred
                    console.error(e) // Log error to console
                    setAlert({ // Set alert state
                        active: true,
                        title: 'Error occurred while process.',
                        description: 'An error occurred while process. Please try again later.',
                        button: 'OK',
                        type: '',
                    })
                }
            }
        })
    }

    return user?.loaded && user?.id && user?.token && user?.admin && (
        <>
            <Head>
                <title>Users — Rival Music</title>
            </Head>
            <div className={styles.mainContainer} ref={contentRef}>
                <h1 className={styles.mainTitle}>Users</h1>
                <div className={styles.actions}>
                    <button onClick={() => setSorting('last-created')} className={sorting === 'last-created' ? styles.active : ''}>Last created</button>
                    <button onClick={() => setSorting('first-created')} className={sorting === 'first-created' ? styles.active : ''}>First created</button>
                    <button onClick={() => setSorting('waiting')} className={sorting === 'waiting' ? styles.active : ''}>Waiting</button>
                </div>
                <div className={styles.searchContainer}>
                    <Input placeholder="Search user by name or email" className={styles.search} onChange={value => setSearch(value)}/>
                </div>
                <div className={styles.usersContainer}>
                    <div className={styles.users}>
                        {users?.map(user => (
                            <Link key={user?._id} className={styles.user} href={`/profile/[id]`} as={`/profile/${user?._id}`}>
                                <div className={styles.profile}>
                                    {user?.image ? <img src={`${process.env.IMAGE_CDN}/${user?.image}`} alt={user?.name}/> : user?.name?.slice(0, 1)?.toUpperCase()}
                                </div>
                                <div className={styles.info}>
                                    <h2 className={styles.name}>{user?.name}</h2>
                                    <p className={styles.description}>{user?.email}</p>
                                </div>
                                {!user?.admin ? (
                                    <div className={styles.operation}>
                                        <button className={user?.accepted ? styles.rejectButton : styles.acceptButton} onClick={e => showAcceptDialogue(e, user?._id || user?.id)}>
                                            {user?.accepted ? (
                                                <CloseIcon stroke={'#1c1c1c'} strokeRate={1.5}/>
                                            ) : (
                                                <AddIcon stroke={'#1c1c1c'} strokeRate={1.5}/>
                                            )}
                                        </button>
                                        <button className={styles.deleteButton} onClick={e => showDeleteDialogue(e, user?._id || user?.id)}>
                                            <DeleteIcon stroke={'#1c1c1c'} strokeRate={1.5}/>
                                        </button>
                                    </div>
                                ) : ''}
                            </Link>
                        ))}
                    </div>
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <div className={styles.loading}></div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}