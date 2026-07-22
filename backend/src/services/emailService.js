import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendCampaignEmail(to, subject, body) {
    const result = await resend.emails.send({
        from: 'PulseMail <onboarding@resend.dev>',
        to,
        subject,
        html: `<div>${body}</div>`,
    });
    return result;
}
//# sourceMappingURL=emailService.js.map