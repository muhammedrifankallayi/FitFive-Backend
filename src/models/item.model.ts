import mongoose, { Document, Schema } from 'mongoose';

export interface IProductReview {
userId: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface IItem extends Document {
  name: string;
  description: string;
  slug: string;
  categoryId: mongoose.Types.ObjectId;
  images: string[];
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  tags: string[];
  attributes: Record<string, any>;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  reviews?: IProductReview[];
}

const itemSchema = new Schema<IItem>(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: [0, 'Compare at price cannot be negative'],
    },
    costPrice: {
      type: Number,
      default: null,
      min: [0, 'Cost price cannot be negative'],
    },
    tags: {
      type: [String],
      default: [],
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    reviews: {
      type: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
          },
          comment: {
            type: String,
            trim: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          updatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
itemSchema.index({ slug: 1 });
itemSchema.index({ sku: 1 });
itemSchema.index({ categoryId: 1 });
itemSchema.index({ isActive: 1 });
itemSchema.index({ isFeatured: 1 });
itemSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IItem>('Item', itemSchema);
