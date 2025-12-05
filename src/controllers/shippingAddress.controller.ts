import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse } from '../types';
import * as ShippingModelModule from '../models/shippingAddress.model';

// The model is exported from the model file; import it as a module and access the runtime model
const ShippingAddressModel = (ShippingModelModule as any).IShippingAddressModel;

class ShippingAddressController {
  // GET /api/shipping-addresses
  getAll = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const page = Number((req.query.page as string) || 1);
    const limit = Number((req.query.limit as string) || 10);
    const search = (req.query.search as string) || '';
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;

    const filter: any = {};
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [
        { fullName: re },
        { phone: re },
        { email: re },
        { city: re },
        { state: re },
      ];
    }

    const total = await ShippingAddressModel.countDocuments(filter);
    const data = await ShippingAddressModel.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const response: ApiResponse = {
      success: true,
      message: `Retrieved ${data.length} shipping addresses`,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.status(200).json(response);
  });

  // GET /api/shipping-addresses/:id
  getById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const addr = await ShippingAddressModel.findById(id).lean();
    if (!addr) throw new AppError('Shipping address not found', 404);
    const response: ApiResponse = { success: true, message: 'Shipping address retrieved', data: addr };
    res.status(200).json(response);
  });

  // POST /api/shipping-addresses
  create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const payload = req.body;
    // rely on mongoose validation in the model
    const created = await ShippingAddressModel.create(payload);
    const response: ApiResponse = { success: true, message: 'Shipping address created', data: created };
    res.status(201).json(response);
  });

  // PUT /api/shipping-addresses/:id
  update = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updates = req.body;
    const existing = await ShippingAddressModel.findById(id);
    if (!existing) throw new AppError('Shipping address not found', 404);
    Object.assign(existing, updates);
    await existing.save();
    const response: ApiResponse = { success: true, message: 'Shipping address updated', data: existing };
    res.status(200).json(response);
  });

  // DELETE /api/shipping-addresses/:id
  delete = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const existing = await ShippingAddressModel.findById(id);
    if (!existing) throw new AppError('Shipping address not found', 404);
    await ShippingAddressModel.findByIdAndDelete(id);
    const response: ApiResponse = { 
      success: true, 
      message: 'Shipping address deleted',
      data: null
    };
    res.status(200).json(response);
  });
}

export default new ShippingAddressController();
