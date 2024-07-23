import { Document, model, Model, Schema } from "mongoose";
import { ObjectId } from "mongodb";

interface IRegisterToken {
  _id?: string;
  token: string;
  userId: ObjectId;
  code: string;
  expiry: Date;
  accepted: boolean;
}

interface RegisterTokenDocument extends Document {
  token: string;
  userId: ObjectId;
  code: string;
  expiry: Date;
  accepted: boolean;
}

const RegisterTokenSchema: Schema = new Schema(
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
    collection: "register-token"
  }
);

const RegisterToken: Model<RegisterTokenDocument> =
  model<RegisterTokenDocument>("RegisterToken", RegisterTokenSchema);

export { IRegisterToken, RegisterTokenDocument, RegisterToken };
