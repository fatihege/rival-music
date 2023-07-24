import checkEmail from '@/utils/check-email'

/**
 * @param {React.MutableRefObject<string>} name
 * @param {React.MutableRefObject<Object>} alertRef
 * @param {Function} setAlert
 * @returns {(function(): (*|undefined))|*}
 */
export const checkNameField = (name, alertRef, setAlert) => () => {
    if (!name.current.length) return setAlert({...alertRef.current, name: null}) // If name field is empty, remove name alert

    if (name.current.trim()?.length < 4) setAlert({...alertRef.current, name: 'The name you entered is too short.'}) // If length of name is less than 4, update name alert
    else setAlert({...alertRef.current, name: null}) // Otherwise, remove name alert
}

/**
 * @param {React.MutableRefObject<string>} email
 * @param {React.MutableRefObject<Object>} alertRef
 * @param {Function} setAlert
 * @returns {(function(): (*|undefined))|*}
 */
export const checkEmailField = (email, alertRef, setAlert) => () => {
    if (!email.current.length) return setAlert({...alertRef.current, email: null}) // If email field is empty, remove email alert

    if (!checkEmail(email.current)) setAlert({ // If email is not matches with valid pattern
        ...alertRef.current,
        email: 'The email address you entered is invalid.' // Update email alert
    })
    else setAlert({...alertRef.current, email: null}) // Otherwise, remove email alert
}

/**
 * @param {React.MutableRefObject<string>} password
 * @param {React.MutableRefObject<string>} passwordConfirm
 * @param {React.MutableRefObject<Object>} alertRef
 * @param {Function} setAlert
 * @returns {(function(): (*|undefined))|*}
 */
export const checkPasswordField = (password, passwordConfirm, alertRef, setAlert) => () => {
    if (!password.current.length) return setAlert({...alertRef.current, password: null}) // If password field is empty, remove password alert

    if (password.current.length < 6) setAlert({...alertRef.current, password: 'Your password is too short.'}) // If length of password is less than 6, update password alert
    else setAlert({...alertRef.current, password: null}) // Otherwise, remove password alert

    checkPasswordConfirmField(password, passwordConfirm, alertRef, setAlert)() // Check for password confirmation field
}

/**
 * @param {React.MutableRefObject<string>} password
 * @param {React.MutableRefObject<string>} passwordConfirm
 * @param {React.MutableRefObject<Object>} alertRef
 * @param {Function} setAlert
 * @returns {(function(): (*|undefined))|*}
 */
export const checkPasswordConfirmField = (password, passwordConfirm, alertRef, setAlert) => () => {
    if (!passwordConfirm.current.length) return setAlert({...alertRef.current, passwordConfirm: null}) // If password confirmation field is empty, remove password confirmation alert

    if (password.current !== passwordConfirm.current) setAlert({ // If value of password and password confirmation field is not equal
        ...alertRef.current,
        passwordConfirm: 'The passwords you entered do not match.' // Update password confirmation alert
    })
    else setAlert({...alertRef.current, passwordConfirm: null}) // Otherwise, remove password confirmation alert
}