import mongoose, { Schema, Types } from "mongoose";

export interface IPurchaseOrder {
    _id: Types.ObjectId;
    supplierId: Types.ObjectId;
    userId: Types.ObjectId;
    orderNumber: string;
    purchaseDate: Date;
    totalAmount: number;
    items: {
        inventoryId: Types.ObjectId;
        qty: number;
        price: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}



const puchaseOrderSchema = new Schema<IPurchaseOrder>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    orderNumber: { type: String, required: true, unique: true },
    purchaseDate: { type: Date, required: true, default: Date.now },
    totalAmount: { type: Number, required: true },
    items: [
        {
            inventoryId: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
            qty: { type: Number, required: true },
            price: { type: Number, required: true },
        }
    ],
}, { timestamps: true });

export const PurchaseOrderModel = mongoose.model<IPurchaseOrder>('PurchaseOrder', puchaseOrderSchema);