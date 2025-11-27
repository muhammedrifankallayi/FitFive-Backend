import mongoose, { Schema, Types } from "mongoose";

export interface IPurchaseOrder {
    _id: Types.ObjectId;
    supplierId: Types.ObjectId;
    userId?: Types.ObjectId;
    orderNumber: string;
    purchaseDate: Date;
    totalAmount: number;
    discount?: number;
    status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
    notes?: string;
    items: {
        inventoryId: Types.ObjectId;
        qty: number;
        price: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}



const puchaseOrderSchema = new Schema<IPurchaseOrder>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    orderNumber: { type: String, required: true, unique: true },
    purchaseDate: { type: Date, required: true, default: Date.now },
    totalAmount: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
        default: 'pending',
        lowercase: true
    },
    notes: { type: String, trim: true },
    items: [
        {
            inventoryId: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
            qty: { type: Number, required: true },
            price: { type: Number, required: true },
        }
    ],
}, { timestamps: true });

export const PurchaseOrderModel = mongoose.model<IPurchaseOrder>('PurchaseOrder', puchaseOrderSchema);