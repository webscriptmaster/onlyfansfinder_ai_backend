/* eslint-disable @typescript-eslint/no-var-requires */
import defaultConfig from "../config/default.config";

const client = require("twilio")(
  defaultConfig.twilio.accountSID,
  defaultConfig.twilio.authToken
);

interface Props {
  to: string;
  body: string;
}

export async function sendSMS({ to, body }: Props) {
  try {
    await client.messages.create({
      from: defaultConfig.twilio.phoneNumber,
      to,
      body
    });

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
