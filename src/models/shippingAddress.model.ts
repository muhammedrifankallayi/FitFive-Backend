import { model, Model, Schema } from "mongoose";

// Customer Shipping Address Interface
export interface IShippingAddressModel {
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  country?: string;
}



const shippingAddressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [100, 'Full name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v: string) {
        return !v || /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  addressLine1: {
    type: String,
    required: [true, 'Address line 1 is required'],
    trim: true,
    minlength: [5, 'Address must be at least 5 characters'],
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  addressLine2: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    minlength: [2, 'City must be at least 2 characters'],
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    minlength: [2, 'State must be at least 2 characters'],
    maxlength: [50, 'State cannot exceed 50 characters']
  },
  pinCode: {
    type: String,
    required: [true, 'Pin code is required'],
    trim: true,
    validate: {
      validator: function (v: string) {
        return /^[1-9][0-9]{5}$/.test(v); // Indian PIN code format
      },
      message: 'Please enter a valid 6-digit postal code'
    }
  },
  country: {
    type: String,
    default: 'India',
    trim: true
  }
},
  {
    timestamps: true
  });


export const IShippingAddressModel: Model<IShippingAddressModel> = model<IShippingAddressModel>("ShippingAddress", shippingAddressSchema);


