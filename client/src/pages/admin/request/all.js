import axios from 'axios'
import Head from 'next/head'
import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import {DialogueContext} from '@/contexts/dialogue'
import Input from '@/components/form/input'
import {DeleteIcon} from '@/icons'
import styles from '@/styles/admin/view-requests.module.sass'

export default function ViewUsersPage() {
    const LIMIT = 66 // Limit of items per request
    const router = useRouter() // Router instance
    const [user] = useContext(AuthContext) // Get the user state from the auth context
    const [sorting, _setSorting] = useState('last-created') // Sorting state
    const [requests, _setRequests] = useState([]) // requests state
    const [, setAlert] = useContext(AlertContext) // Get the alert state from the alert context
    const [, setDialogue] = useContext(DialogueContext) // Get the dialogue state from the dialogue context
    const [loading, setLoading] = useState(false) // Loading state
    const [search, setSearch] = useState('')
    const cursorRef = useRef(0) // Cursor state
    const sortingRef = useRef(sorting) // Sorting ref
    const requestsRef = useRef(requests) // requests ref
    const contentRef = useRef()

    const setSorting = value => { // Set sorting state
        sortingRef.current = value
        _setSorting(value)
    }

    const setRequests = value => { // Set requests state
        requestsRef.current = value
        _setRequests(value)
    }

    const getRequests = async (fromZero = false) => {
        setLoading(true)
        if (fromZero) cursorRef.current = 0 // If fromZero is true, set cursor to 0

        try {
            const response = await axios.get(`${process.env.API_URL}/admin/request${search?.trim()?.length ? `?query=${search.trim()}` : `?cursor=${cursorRef.current}&limit=${LIMIT}&sorting=${sortingRef.current}`}`, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                }
            }) // Get requests from API

            if (response.data?.status === 'OK' && response.data?.requests) { // If response is OK
                setRequests(fromZero ? response.data?.requests : [...requestsRef.current, ...response.data?.requests]) // Set requests state
                cursorRef.current += response.data?.requests?.length || 0 // Increase cursor
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
        if (user?.loaded && user?.id && user?.token && user?.admin) getRequests() // If the user is an admin, get requests from API
    }, [user])

    useEffect(() => { // On sorting state change
        if (user?.loaded && user?.token && user?.id && user?.admin) getRequests(true) // If the user is an admin, get requests from API
    }, [sorting])

    useEffect(() => { // On search state change
        if (user?.loaded && user?.token && user?.id && user?.admin) getRequests(true) // If the user is an admin, get requests from API
    }, [search])

    useEffect(() => {
        if (!contentRef.current) return // If contentRef is not defined, return

        const handleScroll = () => { // Add scroll event listener
            if (search?.trim()?.length) return // If there is a search query, return
            if (contentRef.current.scrollTop + contentRef.current.clientHeight >= contentRef.current.scrollHeight) getRequests() // If the user scrolled to the bottom of the page, get requests from API
        }

        contentRef.current.addEventListener('scroll', handleScroll)

        return () => { // Remove scroll event listener
            if (contentRef.current) contentRef.current.removeEventListener('scroll', handleScroll)
        }
    }, [contentRef.current])

    const showDeleteDialogue = (e, requestId) => {
        e.preventDefault() // Prevent default event
        e.stopPropagation() // Stop event propagation

        if (requestsRef.current.find(a => a?._id === requestId)?.admin) return // If the request is an admin, return

        setDialogue({
            active: true,
            title: 'Delete Request',
            description: 'Are you sure you want to delete this request?',
            button: 'Delete Request',
            type: 'danger',
            callback: () => { // On dialogue button click
                try {
                    axios.delete(`${process.env.API_URL}/admin/request/${requestId}`, { // Delete request from API
                        headers: {
                            Authorization: `Bearer ${user?.token}`,
                        },
                    })
                    setRequests(requestsRef.current.filter(a => a?._id !== requestId)) // Remove request from requests state
                } catch (e) { // If an error occurred
                    console.error(e) // Log error to console
                    setAlert({ // Set alert state
                        active: true,
                        title: 'Error occurred while deleting request.',
                        description: 'An error occurred while deleting request. Please try again later.',
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
                <title>Requests — Rival Music</title>
            </Head>
            <div className={styles.mainContainer} ref={contentRef}>
                <h1 className={styles.mainTitle}>Requests</h1>
                <div className={styles.actions}>
                    <button onClick={() => setSorting('last-created')} className={sorting === 'last-created' ? styles.active : ''}>Last created</button>
                    <button onClick={() => setSorting('first-created')} className={sorting === 'first-created' ? styles.active : ''}>First created</button>
                </div>
                <div className={styles.searchContainer}>
                    <Input placeholder="Search requests by content" className={styles.search} onChange={value => setSearch(value)}/>
                </div>
                <div className={styles.requestsContainer}>
                    <div className={styles.requests}>
                        {requests?.map(request => (
                            <div key={request?._id} className={styles.request}>
                                <div className={styles.info}>
                                    <p className={styles.content}>
                                        {request?.content.split('\n').map((line, index) => (
                                            <span key={index}>{line}<br/></span>
                                        ))}
                                    </p>
                                    <p className={styles.name}>{request?.user?.name}</p>
                                    <p className={styles.email}>{request?.user?.email}</p>
                                </div>
                                {!request?.admin ? (
                                    <div className={styles.operation}>
                                        <button className={styles.deleteButton} onClick={e => showDeleteDialogue(e, request?._id || request?.id)}>
                                            <DeleteIcon stroke={'#1c1c1c'} strokeRate={1.5}/>
                                        </button>
                                    </div>
                                ) : ''}
                            </div>
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