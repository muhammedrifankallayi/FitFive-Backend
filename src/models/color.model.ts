import { Schema, model, Model } from "mongoose";

export interface IColor {
  name: string;
  hex?: string; // optional hex code like '#FF0000'
  rgb?: string; // optional rgb string like 'rgb(255,0,0)'
  createdAt?: Date;
  updatedAt?: Date;
}

const colorSchema = new Schema<IColor>(
  {
    name: {
      type: String,
      required: [true, "Color name is required"],
      trim: true,
      index: true,
      unique: true,
    },
    hex: {
      type: String,
      trim: true,
      match: [/^#([0-9A-Fa-f]{3}){1,2}$/, "Invalid hex color"],
      sparse: true,
    },
    rgb: {
      type: String,
      trim: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

export const ColorModel: Model<IColor> = model<IColor>("Color", colorSchema);
