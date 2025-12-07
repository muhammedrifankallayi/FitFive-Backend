import { Schema, model, Document, Types } from 'mongoose';

// Order item interface
export interface IOrderItem {
  inventoryId: Types.ObjectId;
  qty: number;
}

// Payment details interface
export interface IPaymentDetails {
  method: 'cash' | 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
  transactionId?: string;
  paymentGateway?: string;
  paidAt?: Date;
  failureReason?: string;
}

// Order interface
export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderNo: string;
  userId: Types.ObjectId;
  items: IOrderItem[];
  paymentDetails?: IPaymentDetails;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  totalAmount: number;
  discount: number;
  deliveryType: 'standard' | 'express' | 'overnight' | 'pickup';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  shippingAddressId: Types.ObjectId;
  billingAddressId?: Types.ObjectId;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order item schema
const OrderItemSchema = new Schema<IOrderItem>({
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
}, { _id: false });

// Payment details schema
const PaymentDetailsSchema = new Schema<IPaymentDetails>({
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['cash', 'card', 'upi', 'netbanking', 'wallet', 'cod'],
      message: 'Payment method must be one of: cash, card, upi, netbanking, wallet, cod',
    },
  },
  transactionId: {
    type: String,
    trim: true,
  },
  paymentGateway: {
    type: String,
    trim: true,
  },
  paidAt: {
    type: Date,
  },
  failureReason: {
    type: String,
    trim: true,
  },
}, { _id: false });

// Main Order schema
const OrderSchema = new Schema<IOrder>({
  orderNo: {
    type: String,
    unique: true,
    index: true,
    required: [true, 'Order number is required'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  items: {
    type: [OrderItemSchema],
    required: [true, 'Order items are required'],
    validate: {
      validator: function(items: IOrderItem[]) {
        return items && items.length > 0;
      },
      message: 'Order must contain at least one item',
    },
  },
  paymentDetails: {
    type: PaymentDetailsSchema,
    default: {
      method: 'cash'
    },
  },
  status: {
    type: String,
    required: [true, 'Order status is required'],
    enum: {
      values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      message: 'Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled, returned',
    },
    default: 'pending',
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative'],
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
  },
  deliveryType: {
    type: String,
    required: [true, 'Delivery type is required'],
    enum: {
      values: ['standard', 'express', 'overnight', 'pickup'],
      message: 'Delivery type must be one of: standard, express, overnight, pickup',
    },
    default: 'standard',
  },
  paymentStatus: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      message: 'Payment status must be one of: pending, paid, failed, refunded, partially_refunded',
    },
    default: 'pending',
  },
  shippingAddressId: {
    type: Schema.Types.ObjectId,
    ref: 'ShippingAddress',
    required: [true, 'Shipping address is required'],
  },
  billingAddressId: {
    type: Schema.Types.ObjectId,
    ref: 'ShippingAddress',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  expectedDeliveryDate: {
    type: Date,
  },
  actualDeliveryDate: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
  },
  trackingNumber: {
    type: String,
    trim: true,
    maxlength: [100, 'Tracking number cannot exceed 100 characters'],
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters'],
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes for better performance
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ orderDate: -1 });
OrderSchema.index({ 'items.inventoryId': 1 });

// Virtual for final amount after discount
OrderSchema.virtual('finalAmount').get(function() {
  return this.totalAmount - this.discount;
});

// Pre-save middleware to generate orderNo
OrderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNo) {
    try {
      // Get the count of existing orders to generate unique orderNo
      const Order = this.constructor as any;
      const lastOrder = await Order.findOne({}, { orderNo: 1 }, { sort: { _id: -1 } });
      
      let orderNumber = 1;
      if (lastOrder && lastOrder.orderNo) {
        // Extract number from orderNo (e.g., "ORD000001" -> 1)
        const lastNumber = parseInt(lastOrder.orderNo.replace('ORD', ''));
        if (!isNaN(lastNumber)) {
          orderNumber = lastNumber + 1;
        }
      }
      
      // Format orderNo with leading zeros (ORD000001, ORD000002, etc.)
      this.orderNo = `ORD${String(orderNumber).padStart(6, '0')}`;
    } catch (err: any) {
      // If there's an error in generating orderNo, let it fail at schema validation
      next(err);
      return;
    }
  }
  next();
});

// Pre-save middleware to set expected delivery date based on delivery type
OrderSchema.pre('save', function(next) {
  if (this.isNew && !this.expectedDeliveryDate) {
    const now = new Date();
    let daysToAdd = 7; // Default standard delivery
    
    switch (this.deliveryType) {
      case 'express':
        daysToAdd = 3;
        break;
      case 'overnight':
        daysToAdd = 1;
        break;
      case 'pickup':
        daysToAdd = 0;
        break;
      default:
        daysToAdd = 7;
    }
    
    this.expectedDeliveryDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
  }
  next();
});

// Pre-save middleware to set cancelled date when status changes to cancelled
OrderSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'cancelled' && !this.cancelledAt) {
    this.cancelledAt = new Date();
  }
  next();
});

// Pre-save middleware to set actual delivery date when status changes to delivered
OrderSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'delivered' && !this.actualDeliveryDate) {
    this.actualDeliveryDate = new Date();
  }
  next();
});

// Static method to get order statistics
OrderSchema.statics.getOrderStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
  ]);
};

// Instance method to check if order can be cancelled
OrderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Instance method to cancel order
OrderSchema.methods.cancelOrder = function(reason: string) {
  if (!this.canBeCancelled()) {
    throw new Error('Order cannot be cancelled in current status');
  }
  
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancellationReason = reason;
  
  return this.save();
};

export const Order = model<IOrder>('Order', OrderSchema);
export default Order;