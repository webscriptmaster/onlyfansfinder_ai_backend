import { compareSync, genSaltSync, hashSync } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { Document, model, Model, Schema } from "mongoose";

import defaultConfig from "../config/default.config";

interface IUser {
  _id?: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  address: string;
  password: string;
  status: string;

  // Customer properties
  qa: {
    question: string;
    answers: string[];
  }[];

  // Creator properties
  characteristics: string[];
  subscriptionId: string;

  isStatic?: boolean;
  avatar?: string;
  gender?: string;
  description?: string;
  cost?: number;

  items?: string[];
  includes?: string;

  likes?: number;
  pictures?: number;
  videos?: number;

  shares?: {
    twitter: boolean;
    instagram: boolean;
    tiktok: boolean;
  };

  // Methods
  comparePassword(password: string): boolean;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

interface UserDocument extends Document {
  role: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  address: string;
  password: string;
  status: string;

  // Customer properties
  qa: {
    question: string;
    answers: string[];
  }[];

  // Creator properties
  characteristics: string[];
  subscriptionId: string;

  isStatic?: boolean;
  avatar?: string;
  gender?: string;
  description?: string;
  cost?: number;

  items?: string[];
  includes?: string;

  likes?: number;
  pictures?: number;
  videos?: number;

  shares?: {
    twitter: boolean;
    instagram: boolean;
    tiktok: boolean;
  };
}

const UserSchema: Schema = new Schema(
  {
    role: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, required: true },

    // Customer properties
    qa: {
      type: [
        {
          question: String,
          answers: [String]
        }
      ],
      required: false
    },

    // Creator properties
    characteristics: { type: [String], required: false },
    subscriptionId: { type: String, required: false },

    isStatic: { type: Boolean, required: false },
    avatar: { type: String, required: false },
    gender: { type: String, required: false },
    description: { type: String, required: false },
    cost: { type: Number, required: false },

    items: { type: [String], required: false },
    includes: { type: String, required: false },

    likes: { type: Number, required: false },
    pictures: { type: Number, required: false },
    videos: { type: Number, required: false },

    shares: {
      type: {
        twitter: { type: Boolean },
        instagram: { type: Boolean },
        tiktok: { type: Boolean }
      },
      required: false
    }
  },
  {
    timestamps: true,
    collection: "users"
  }
);

UserSchema.pre<UserDocument>(
  "save",
  function preSave(this: UserDocument, next) {
    if (!this.isModified("password")) {
      next();
    }

    const salt = genSaltSync(defaultConfig.bcrypt.salt);
    this.password = hashSync(this.password, salt);
    next();
  }
);

UserSchema.methods.comparePassword = function comparePassword(
  password: string
) {
  return compareSync(password, this.password);
};

UserSchema.methods.generateAccessToken = function generateAccessToken() {
  const accessToken = sign(
    {
      _id: this._id,
      role: this.role,
      name: this.name,
      email: this.email,
      phone: this.phone,
      status: this.status
    },
    defaultConfig.jwt.access.secret,
    {
      expiresIn: `${defaultConfig.jwt.access.expiry_hour}h`
    }
  );

  return accessToken;
};

UserSchema.methods.generateRefreshToken = function generateRefreshToken() {
  const refreshToken = sign(
    {
      _id: this._id,
      role: this.role,
      name: this.name,
      email: this.email,
      phone: this.phone,
      status: this.status
    },
    defaultConfig.jwt.refresh.secret,
    {
      expiresIn: `${defaultConfig.jwt.refresh.expiry_hour}h`
    }
  );

  return refreshToken;
};

const User: Model<UserDocument> = model<UserDocument>("User", UserSchema);

export { IUser, UserDocument, User };
