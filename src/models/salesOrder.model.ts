import mongoose, { Schema, Types } from "mongoose";

export interface ISalesOrder {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    orderNumber: string;
    salesDate: Date;
    totalAmount: number;
    customerId: Types.ObjectId;
    totalDiscount: number;
    items: {
        inventoryId: Types.ObjectId;
        qty: number;
        price: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const salesOrderSchema = new Schema<ISalesOrder>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    orderNumber: { type: String, required: true, unique: true },
    salesDate: { type: Date, required: true, default: Date.now },
    totalAmount: { type: Number, required: true },
    totalDiscount: { type: Number, required: true },
    items: [
        {
            inventoryId: { type: Schema.Types.ObjectId, ref: 'Inventory', required: true },
            qty: { type: Number, required: true },
            price: { type: Number, required: true },
        }
    ],
}, { timestamps: true });

export const SalesOrderModel = mongoose.model<ISalesOrder>('SalesOrder', salesOrderSchema);