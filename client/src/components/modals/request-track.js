import axios from 'axios'
import {useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {ModalContext} from '@/contexts/modal'
import Textarea from '@/components/form/textarea'
import Button from '@/components/form/button'
import {NextIcon} from '@/icons'
import styles from '@/styles/modals.module.sass'

export default function RequestTrack() {
    const [user] = useContext(AuthContext) // Get user from auth context
    const [, setModal] = useContext(ModalContext) // Get modal state from modal context
    const [canRequest, setCanRequest] = useState(null) // Can request state
    const [requests, setRequests] = useState([]) // Requests state
    const [content, setContent] = useState('') // Content state
    const [disabled, setDisabled] = useState(false) // Disabled state

    useEffect(() => {
        if (!user?.loaded) return // If user is not loaded, return
        if (!user?.id || !user?.token) { // If user is not logged in
            setModal({ // Close modal
                canClose: true,
                active: null,
            })
            return // Return
        }

        if (canRequest === null) { // If can request state is null
            axios.get(`${process.env.API_URL}/request/can-request/${user?.id}`, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                }
            }) // Get can request state
                .then(res => { // If success
                    setCanRequest(res.data.canRequest) // Set can request state
                    setRequests(res.data.requests) // Set requests state
                })
                .catch(console.error) // Log error
        }

        if (canRequest === false) // If can request state is false
            setModal({ // Close modal
                canClose: true,
                active: null,
            })
    }, [canRequest, user])

    const handleSubmit = () => {
        setDisabled(true) // Disable button
        axios.post(`${process.env.API_URL}/request`, { // Post request
            content,
        }, {
            headers: {
                Authorization: `Bearer ${user?.token}`,
            }
        })
            .then(res => { // If success
                setContent('') // Reset content state
                setRequests([...requests, res.data.request]) // Add request to requests state
                setDisabled(false) // Enable button
            })
            .catch(console.error) // Log error
    }

    return canRequest ? (
        <div className={styles.requestTrack}>
            <h2 className={styles.title}>Request tracks</h2>
            <p className={styles.description}>You can request a maximum of 3 times at the same time. Write all the tracks you want at once.</p>
            <p className={styles.remaining}>
                Your remaining requests: <span className={styles.count}>{Math.max(0, 3 - (requests?.length || 0))}</span>
            </p>
            {(requests?.length || 0) < 3 ? (
                <>
                    <Textarea placeholder={'Write all the tracks you want at once.'} className={styles.field}
                                value={content} onChange={value => setContent(value)}/>
                    <Button className={styles.field} value="Request" icon={<NextIcon stroke={'#1c1c1c'}/>} disabled={disabled}
                            onClick={handleSubmit}/>
                </>
            ) : ''}
            {requests?.length ? (
                <div className={styles.previousRequests}>
                    <h3 className={styles.title}>Previous requests</h3>
                    {requests.map((request, index) => (
                        <div key={index} className={styles.requestItem}>
                            <p className={styles.requestContent}>
                                {request.content.split('\n').map((line, index) => (
                                    <span key={index}>
                                        {line}
                                        <br/>
                                    </span>
                                ))}
                            </p>
                            <p className={styles.requestDate}>{new Date(request.createdAt).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            ) : ''}
        </div>
    ) : ''
}