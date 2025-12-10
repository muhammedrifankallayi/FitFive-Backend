import { Request, Response, NextFunction } from 'express';
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse } from '../types';
import Order from '../models/order.model';




// Determine Cashfree environment based on env variable
const cashfreeEnv = process.env.CASHFREE_ENV === 'production'
  ? CFEnvironment.PRODUCTION
  : CFEnvironment.SANDBOX;

// Initialize Cashfree
const cashfree = new Cashfree(
  cashfreeEnv,
  process.env.CASHFREE_APP_ID || "TEST1089341652454be775c03638114461439801",
  process.env.CASHFREE_SECRET_KEY || "cfsk_ma_test_44df66d1d0d81b987daeeaa03f8a997a_2b2f1ba6"
);

interface CreatePaymentOrderDto {
  orderId: string;
  amount: number;
  customerId: string;
  customerPhone: string;
  returnUrl?: string;
}

class CashFreeController {
  /**
   * Create payment order in CashFree
   * @route POST /api/cashfree/create-order
   */
  createPaymentOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { orderId, amount, customerId, customerPhone, returnUrl } = req.body as CreatePaymentOrderDto;

    // Validate required fields
    if (!orderId || !amount || !customerId || !customerPhone) {
      throw new AppError('orderId, amount, customerId, and customerPhone are required', 400);
    }

    if (amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400);
    }

    try {
      // Verify order exists
      //   const order = await Order.findById(orderId).exec();
      //   if (!order) {
      //     throw new AppError('Order not found', 404);
      //   }

      // Create CashFree order
      const request = {
        order_amount: amount,
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
          customer_id: customerId,
          customer_phone: customerPhone,
        },
        order_meta: {
          return_url: returnUrl || `${process.env.FRONTEND_URL || 'https://thefitfive.com'}/payment/callback?order_id={order_id}`
        }
      };

      console.log(request, process.env.CASHFREE_SECRET_KEY, process.env.CASHFREE_APP_ID);


      const cfResponse = await cashfree.PGCreateOrder(request);

      const response: ApiResponse<any> = {
        success: true,
        message: 'Payment order created successfully',
        data: cfResponse.data,
      };

      res.status(201).json(response);
    } catch (error: any) {
      console.error('CashFree Order Creation Error:', error);
      throw new AppError(
        error.response?.data?.message || 'Failed to create payment order',
        error.response?.status || 400
      );
    }
  });

  /**
   * Get payment order status from CashFree
   * @route GET /api/cashfree/order/:orderId
   */
  getOrderStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { orderId } = req.params;

    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }

    try {
      // Get order status from CashFree
      const cfResponse = await cashfree.PGFetchOrder(orderId);

      const response: ApiResponse<any> = {
        success: true,
        message: 'Order status retrieved successfully',
        data: cfResponse,
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('CashFree Fetch Order Error:', error);
      throw new AppError(
        error.response?.data?.message || 'Failed to fetch order status',
        error.response?.status || 400
      );
    }
  });

  /**
   * Webhook to handle payment callback from CashFree
   * @route POST /api/cashfree/webhook
   */
  handlePaymentCallback = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { orderId, orderAmount, paymentStatus, transactionId } = req.body;

    if (!orderId || !orderAmount || !paymentStatus) {
      throw new AppError('orderId, orderAmount, and paymentStatus are required', 400);
    }

    try {
      // Update order payment status
      const updateData: any = {
        paymentDetails: {
          transactionId: transactionId,
          status: paymentStatus.toLowerCase(),
          gateway: 'cashfree'
        }
      };

      if (paymentStatus.toLowerCase() === 'success' || paymentStatus.toLowerCase() === 'paid') {
        updateData.paymentStatus = 'paid';
        updateData.paymentPaidAt = new Date();
      } else if (paymentStatus.toLowerCase() === 'failed') {
        updateData.paymentStatus = 'failed';
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        updateData,
        { new: true }
      ).exec();

      if (!updatedOrder) {
        throw new AppError('Order not found', 404);
      }

      const response: ApiResponse<any> = {
        success: true,
        message: 'Payment callback processed successfully',
        data: {
          orderId,
          paymentStatus: updatedOrder.paymentStatus
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Webhook Error:', error);
      throw new AppError('Failed to process payment callback', 400);
    }
  });
}

export default new CashFreeController();