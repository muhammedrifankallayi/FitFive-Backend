import { Schema, model, Model, Types } from "mongoose";


export interface IInventory {
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  // references to Size and Color documents
  size: Types.ObjectId;
  color: Types.ObjectId;
  item: Types.ObjectId;
  stock: number;
  sku?: string;
   tags: string[];
  attributes: Record<string, any>;
  barcode?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    item:{
        type: Schema.Types.ObjectId,
        ref: "Item",
        required: [true, "Item reference is required"]

    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: [0, "Compare at price cannot be negative"],
    },
    costPrice: {
      type: Number,
      default: null,
      min: [0, "Cost price cannot be negative"],
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    sku: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    barcode: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    size: {
      type: Schema.Types.ObjectId,
      ref: "Size",
      required: [true, "Size is required"],
    },
    color: {
      type: Schema.Types.ObjectId,
      ref: "Color",
      required: [true, "Color is required"],
    },
    tags:{
        type: [String],
        default: []
    },
    attributes: {
        type: Schema.Types.Mixed,
        default: {}
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Export the model
export const InventoryModel: Model<IInventory> = model<IInventory>("Inventory", inventorySchema);