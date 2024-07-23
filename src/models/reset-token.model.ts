import { Document, model, Model, Schema } from "mongoose";
import { ObjectId } from "mongodb";

interface IResetToken {
  _id?: string;
  token: string;
  userId: ObjectId;
  code: string;
  expiry: Date;
  accepted: boolean;
}

interface ResetTokenDocument extends Document {
  token: string;
  userId: ObjectId;
  code: string;
  expiry: Date;
  accepted: boolean;
}

const ResetTokenSchema: Schema = new Schema(
  {
    token: {
      type: String,
      required: true
    },
    userId: {
      type: ObjectId,
      required: true
    },
    code: {
      type: String,
      required: true
    },
    expiry: {
      type: Date,
      required: true
    },
    accepted: {
      type: Boolean,
      required: true
    }
  },
  {
    timestamps: false,
    collection: "reset-token"
  }
);

const ResetToken: Model<ResetTokenDocument> = model<ResetTokenDocument>(
  "ResetToken",
  ResetTokenSchema
);

export { IResetToken, ResetTokenDocument, ResetToken };
