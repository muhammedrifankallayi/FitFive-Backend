import mongoose, { Schema } from "mongoose";


export interface ICartItem {
    inventoryId: Schema.Types.ObjectId;
    qty: number;
}

export interface ICart  {
    _id: string;
    userId: Schema.Types.ObjectId;
    items: ICartItem[];
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}


const cartSchema = new Schema<ICart>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            index: true,
        },
        items: [    
            {
                inventoryId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Inventory',
                    required: [true, 'Inventory ID is required'],
                },
                qty: {
                    type: Number,
                    required: [true, 'Quantity is required'],
                    min: [1, 'Quantity must be at least 1'],
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: [true, 'Total amount is required'],
            min: [0, 'Total amount cannot be negative'],
            default: 0,
        },
    },
    { timestamps: true }
);


export const CartModel = mongoose.model<ICart>('Cart', cartSchema);