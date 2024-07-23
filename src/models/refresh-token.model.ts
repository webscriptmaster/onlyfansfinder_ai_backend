import { Document, model, Model, Schema } from "mongoose";
import { ObjectId } from "mongodb";

interface IRefreshToken {
  _id?: string;
  userId: ObjectId;
  token: string;
  expiry: Date;
}

interface RefreshTokenDocument extends Document {
  userId: ObjectId;
  token: string;
  expiry: Date;
}

const RefreshTokenSchema: Schema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true
    },
    token: {
      type: String,
      required: true
    },
    expiry: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true,
    collection: "refresh-token"
  }
);

const RefreshToken: Model<RefreshTokenDocument> = model<RefreshTokenDocument>(
  "RefreshToken",
  RefreshTokenSchema
);

export { IRefreshToken, RefreshTokenDocument, RefreshToken };
