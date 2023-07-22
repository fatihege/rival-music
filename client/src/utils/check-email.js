/**
 * @param {string} email
 * @returns {*}
 */
export default email => email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)