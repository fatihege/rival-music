import mailer from '../lib/mailer.js'

export default ({email, subject, html, text}, callback) => {
    mailer(process.env.MAIL_USER, process.env.MAIL_PASS).sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject,
        html,
        text,
    }, callback)
}