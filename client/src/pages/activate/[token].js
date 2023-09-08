import axios from 'axios'
import Head from 'next/head'
import {useRouter} from 'next/router'
import {useContext, useEffect} from 'react'
import {AlertContext} from '@/contexts/alert'
import {ModalContext} from '@/contexts/modal'

export function getServerSideProps(context) {
    return {
        props: {
            token: context.params.token,
        },
    }
}

export default function ActivationPage({token}) {
    const router = useRouter()
    const [, setAlertPopup] = useContext(AlertContext) // Use alert context
    const [, setModal] = useContext(ModalContext) // Use modal context

    useEffect(() => {
        setModal({
            active: null,
            canClose: true,
        })

        if (!token) return // If token is not defined, return

        axios.post(`${process.env.API_URL}/user/activate`, {token}) // Send POST request to the API
            .then(response => {
                if (response.data?.status === 'OK') { // If there is status data in the response
                    localStorage.setItem('token', response.data?.token) // Update token value in local storage
                    router.push('/').then(() => router.reload()) // Redirect to home page and reload the page
                }
            })
            .catch(e => {
                console.error(e)

                if (e?.response?.data?.status === 'TOKEN_EXPIRED') { // If there is TOKEN_EXPIRED error
                    setAlertPopup({ // Show an alert
                        active: true,
                        title: 'Activation link expired',
                        description: e?.response?.data?.newToken ?
                            'Your activation link has expired. We sent you a new activation link to your email address.' :
                            'Your activation link has expired. Please try again later.',
                        button: 'OK',
                        type: '',
                    })
                    router.push('/')
                } else if (e?.response?.data?.status === 'USER_NOT_FOUND') { // If there is USER_NOT_FOUND error
                    setAlertPopup({ // Show an alert
                        active: true,
                        title: 'No user found',
                        description: 'No user found with this activation link. Please try again later.',
                        button: 'OK',
                        type: '',
                    })
                    router.push('/')
                } else {
                    setAlertPopup({ // Otherwise, show an alert
                        active: true,
                        title: 'We are sorry',
                        description: 'An unknown error occurred. Please try again later.',
                        button: 'OK',
                        type: '',
                    })
                    router.push('/')
                }
            })
    }, [token])

    return (
        <Head>
            <title>Account Activation {process.env.SEPARATOR} {process.env.APP_NAME}</title>
        </Head>
    )
}