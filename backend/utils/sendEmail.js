import nodemailer from 'nodemailer';

/**
 * Creates and returns configured Nodemailer transporter
 */
const createTransporter = async () => {
    // 1. Check for standard SMTP configuration (Resend, SendGrid, Brevo, AWS SES)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // 2. Check for Gmail service shortcut
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const cleanPass = process.env.EMAIL_PASS.replace(/\s+/g, '');
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER.trim(),
                pass: cleanPass,
            },
        });
    }

    // 3. Fallback to Ethereal Test Account in development if no SMTP credentials set
    console.log('⚠️ No SMTP credentials configured. Generating temporary Ethereal test inbox...');
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
};

/**
 * Send password reset email
 * @param {Object} options - { to, name, resetUrl }
 */
export const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
    try {
        const transporter = await createTransporter();
        const fromAddress = process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `"Clothings Store Support" <${process.env.EMAIL_USER}>` : '"Clothings Store Support" <support@clothingsstore.com>');

        const mailOptions = {
            from: fromAddress,
            to,
            subject: 'Password Reset Request — Clothings Store',
            text: `Hello ${name || 'Valued Customer'},\n\nYou requested to reset your password. Please click the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not request this, please ignore this email.`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
                        .container { max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
                        .header { background: #0f172a; padding: 32px 24px; text-align: center; }
                        .header h1 { color: #d5a249; margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 700; }
                        .header p { color: #94a3b8; margin: 6px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; }
                        .body { padding: 36px 32px; color: #334155; line-height: 1.6; }
                        .body h2 { color: #0f172a; font-size: 20px; margin-top: 0; }
                        .button-wrapper { text-align: center; margin: 32px 0; }
                        .button { background: #01579b; color: #ffffff !important; padding: 14px 32px; border-radius: 8px; font-weight: 600; text-decoration: none; display: inline-block; font-size: 15px; }
                        .fallback-box { background: #f1f5f9; padding: 12px 16px; border-radius: 6px; font-size: 12px; word-break: break-all; color: #475569; margin-top: 20px; }
                        .footer { background: #f8fafc; padding: 20px 32px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>CLOTHINGS STORE</h1>
                            <p>Luxury Menswear & Modern Essentials</p>
                        </div>
                        <div class="body">
                            <h2>Password Reset Request</h2>
                            <p>Hello <strong>${name || 'Valued Customer'}</strong>,</p>
                            <p>We received a request to reset the password associated with your account (<strong>${to}</strong>).</p>
                            <div class="button-wrapper">
                                <a href="${resetUrl}" target="_blank" class="button">Reset Password</a>
                            </div>
                            <p style="font-size: 13px; color: #64748b;">This link is secure and will remain active for <strong>15 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
                            <div class="fallback-box">
                                If the button above doesn't work, copy and paste this URL into your browser:<br/>
                                <a href="${resetUrl}" style="color: #01579b;">${resetUrl}</a>
                            </div>
                        </div>
                        <div class="footer">
                            © 2026 Clothings Store. All rights reserved.<br/>
                            This is an automated security email, please do not reply.
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✉️ Password reset email dispatched to ${to} (MessageId: ${info.messageId})`);

        // If using Ethereal in dev, log the interactive web preview URL
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`🔗 Ethereal Email Preview URL: ${previewUrl}`);
        }

        return { success: true, messageId: info.messageId, previewUrl };
    } catch (err) {
        console.error('❌ Failed to send password reset email:', err);
        return { success: false, error: err.message };
    }
};

export default {
    sendPasswordResetEmail,
};
