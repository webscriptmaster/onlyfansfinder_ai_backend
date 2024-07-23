import dotenv from "dotenv";

dotenv.config();

const defaultConfig = {
  app: {
    port: Number(process.env.PORT) || 5000,
    env: process.env.APP_ENV || "",
    frontend: process.env.APP_FRONTEND || ""
  },

  bcrypt: {
    salt: Number(process.env.BCRYPT_SALT) || 10
  },

  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET || "",
      expiry_hour: Number(process.env.JWT_ACCESS_EXPIRY_HOUR)
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET || "",
      expiry_hour: Number(process.env.JWT_REFRESH_EXPIRY_HOUR)
    }
  },

  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/onlyfansfinderai"
  },

  signup: {
    expiry_hour: Number(process.env.SIGNUP_EXPIRY_HOUR) || 12
  },

  forgot: {
    expiry_hour: Number(process.env.FORGOT_EXPIRY_HOUR) || 12
  },

  email: {
    host: process.env.EMAIL_HOST || "",
    port: Number(process.env.EMAIL_PORT) || 0,
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
    from: process.env.EMAIL_FROM || ""
  },

  twilio: {
    accountSID: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || ""
  }
};

export default defaultConfig;
