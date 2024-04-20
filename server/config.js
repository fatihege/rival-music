export default {
    allowedIps: [
        '172.18.0.1',
        '::ffff:172.18.0.1',
    ],
    activationMail: (token) => ({
        subject: 'Rival Account Activation',
        html: `
        <h1>Activate Your Account</h1>
        <p>Click the link below to activate your account.</p>
        <a href="${process.env.CLIENT_URL}/activate/${token}">Activate Account</a>
        `,
        text: `
        Activate Your Account
        Open the link below to activate your account.
        ${process.env.CLIENT_URL}/activate/${token}
        `,
    }),
    resetPasswordMail: (token) => ({
        subject: 'Rival Password Reset',
        html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password.</p>
        <a href="${process.env.CLIENT_URL}/reset-password/${token}">Reset Password</a>
        `,
        text: `
        Reset Your Password
        Open the link below to reset your password.
        ${process.env.CLIENT_URL}/reset-password/${token}
        `,
    }),
}