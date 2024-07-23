import { createTransport } from "nodemailer";

import defaultConfig from "../config/default.config";

interface Props {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: Props) {
  try {
    const transporter = createTransport({
      host: defaultConfig.email.host,
      port: defaultConfig.email.port,
      // secure: true,
      auth: {
        user: defaultConfig.email.user,
        pass: defaultConfig.email.pass
      }
    });

    await transporter.sendMail({
      from: defaultConfig.email.from,
      to,
      subject,
      text,
      html
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
