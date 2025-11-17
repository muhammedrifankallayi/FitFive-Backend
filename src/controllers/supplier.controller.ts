import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse } from '../types';
import { SupplierModel, ISupplierModel } from '../models/supplier.model';

export interface CreateSupplierDto {
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

class SupplierController {
  /**
   * Create new supplier
   * @route POST /api/suppliers
   */
  createSupplier = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { name, email, phone, address, notes } = req.body as CreateSupplierDto;

    // Validate required fields
    if (!name || !email || !phone) {
      throw new AppError('Name, email, and phone are required', 400);
    }

    // Check if supplier with email already exists
    const existingSupplier = await SupplierModel.findOne({ email }).exec();
    if (existingSupplier) {
      throw new AppError('Supplier with this email already exists', 409);
    }

    const supplier = await SupplierModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address?.trim(),
      notes: notes?.trim()
    });

    const response: ApiResponse<ISupplierModel> = {
      success: true,
      message: 'Supplier created successfully',
      data: supplier.toObject(),
    };

    res.status(201).json(response);
  });

  /**
   * Get all suppliers with pagination
   * @route GET /api/suppliers
   */
  getAllSuppliers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    // Build search query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const [suppliers, total] = await Promise.all([
      SupplierModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      SupplierModel.countDocuments(query)
    ]);

    const response: ApiResponse<ISupplierModel[]> = {
      success: true,
      message: 'Suppliers retrieved successfully',
      data: suppliers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.status(200).json(response);
  });

  /**
   * Get supplier by ID
   * @route GET /api/suppliers/:id
   */
  getSupplierById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const supplier = await SupplierModel.findById(id).lean().exec();

    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    const response: ApiResponse<ISupplierModel> = {
      success: true,
      message: 'Supplier retrieved successfully',
      data: supplier,
    };

    res.status(200).json(response);
  });

  /**
   * Update supplier
   * @route PATCH /api/suppliers/:id
   */
  updateSupplier = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body as UpdateSupplierDto;

    // Remove undefined values and trim strings
    const cleanedData: Partial<ISupplierModel> = {};
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanedData[key as keyof ISupplierModel] = typeof value === 'string' 
          ? value.trim() 
          : value;
      }
    });

    // Handle email uniqueness if being updated
    if (cleanedData.email) {
      const existingSupplier = await SupplierModel.findOne({ 
        email: cleanedData.email,
        _id: { $ne: id }
      }).exec();
      
      if (existingSupplier) {
        throw new AppError('Supplier with this email already exists', 409);
      }
      
      cleanedData.email = cleanedData.email.toLowerCase();
    }

    const updatedSupplier = await SupplierModel.findByIdAndUpdate(
      id,
      cleanedData,
      { 
        new: true, 
        runValidators: true 
      }
    ).lean().exec();

    if (!updatedSupplier) {
      throw new AppError('Supplier not found', 404);
    }

    const response: ApiResponse<ISupplierModel> = {
      success: true,
      message: 'Supplier updated successfully',
      data: updatedSupplier,
    };

    res.status(200).json(response);
  });

  /**
   * Delete supplier
   * @route DELETE /api/suppliers/:id
   */
  deleteSupplier = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    // Check if supplier is referenced in any purchase orders
    const { PurchaseOrderModel } = await import('../models/purchaseOrder.model');
    const referencedOrders = await PurchaseOrderModel.countDocuments({ supplierId: id }).exec();
    
    if (referencedOrders > 0) {
      throw new AppError(
        `Cannot delete supplier. It is referenced in ${referencedOrders} purchase order(s)`, 
        400
      );
    }

    const deletedSupplier = await SupplierModel.findByIdAndDelete(id).exec();

    if (!deletedSupplier) {
      throw new AppError('Supplier not found', 404);
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Supplier deleted successfully',
      data: null,
    };

    res.status(200).json(response);
  });

  /**
   * Get supplier statistics
   * @route GET /api/suppliers/stats
   */
  getSupplierStats = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const totalSuppliers = await SupplierModel.countDocuments().exec();
    
    // Get suppliers created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSuppliers = await SupplierModel.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    }).exec();

    // Get active suppliers (those with recent purchase orders)
    const { PurchaseOrderModel } = await import('../models/purchaseOrder.model');
    const activeSuppliers = await PurchaseOrderModel.distinct('supplierId', {
      createdAt: { $gte: thirtyDaysAgo }
    }).exec();

    const response: ApiResponse<{ total: number; recent: number; active: number }> = {
      success: true,
      message: 'Supplier statistics retrieved successfully',
      data: {
        total: totalSuppliers,
        recent: recentSuppliers,
        active: activeSuppliers.length
      },
    };

    res.status(200).json(response);
  });
}

export default new SupplierController();