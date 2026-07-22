import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function sendCampaignEmail(to: string, subject: string, body: string) {
  const result = await resend.emails.send({
    from: 'PulseMail <onboarding@resend.dev>',
    to,
    subject,
    html: `<div>${body}</div>`,
  });
  return result;
}