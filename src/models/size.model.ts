import { Schema, model, Model } from "mongoose";

export interface ISize {
  name: string;
  code?: string; // optional code like 'S', 'M', 'L' or 'US-10'
  createdAt?: Date;
  updatedAt?: Date;
}

const sizeSchema = new Schema<ISize>(
  {
    name: {
      type: String,
      required: [true, "Size name is required"],
      trim: true,
      index: true,
      unique: true,
    },
    code: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

export const SizeModel: Model<ISize> = model<ISize>("Size", sizeSchema);
