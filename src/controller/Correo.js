import emailjs from 'emailjs-com';

import { Resend } from 'resend';

const resend = new Resend('re_WH9u3jVe_37bsXSDrWqxDUwLZCFcjB3aK');

async function sendEmail(to, subject, body) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'proyectosoftware07@gmail.com',
      to: [to],
      subject: subject,
      html: body
    });

    if (error) {
      console.error({ error });
      return;
    }

    console.log({ data });
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

export default sendEmail;

