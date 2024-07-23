import { Document, model, Model, Schema } from "mongoose";

interface IFavorite {
  _id?: string;
  userId: string;
  creatorId: string[];
}

interface FavoriteDocument extends Document {
  userId: string;
  creatorId: string[];
}

const FavoriteSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    creatorId: { type: [String], required: true }
  },
  {
    timestamps: true,
    collection: "favorite"
  }
);

const Favorite: Model<FavoriteDocument> = model<FavoriteDocument>(
  "Favorite",
  FavoriteSchema
);

export { IFavorite, FavoriteDocument, Favorite };
