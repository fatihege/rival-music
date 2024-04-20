import nodemailer from 'nodemailer'

export default (user, pass) => nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user,
        pass,
    }
})