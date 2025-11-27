import mongoose, { Schema, Types } from "mongoose";

export interface ISupplierModel {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    address?: string;
    notes?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const supplierSchema = new Schema<ISupplierModel>({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator: function(v: string) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        validate: {
            validator: function(v: string) {
                return /^[6-9]\d{9}$/.test(v); // Indian phone number format
            },
            message: 'Please enter a valid 10-digit phone number'
        }
    },
    address: {
        type: String,
        trim: true,
        maxlength: [500, 'Address cannot exceed 500 characters']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const SupplierModel = mongoose.model<ISupplierModel>('Supplier', supplierSchema);