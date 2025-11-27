import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse } from '../types';
import { CustomerModel, ICustomerModel } from '../models/customer.model';

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

class CustomerController {
  /**
   * Create new customer
   * @route POST /api/customers
   */
  createCustomer = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { name, email, phone, address, notes } = req.body as CreateCustomerDto;

    // Validate required fields
    if (!name || !email || !phone) {
      throw new AppError('Name, email, and phone are required', 400);
    }

    // Check if customer with email already exists
    const existingCustomer = await CustomerModel.findOne({ email }).exec();
    if (existingCustomer) {
      throw new AppError('Customer with this email already exists', 409);
    }

    const customer = await CustomerModel.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address?.trim(),
      notes: notes?.trim(),
      isActive: true
    });

    const response: ApiResponse<ICustomerModel> = {
      success: true,
      message: 'Customer created successfully',
      data: customer.toObject(),
    };

    res.status(201).json(response);
  });

  /**
   * Get all customers with pagination
   * @route GET /api/customers
   */
  getAllCustomers = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const isActive = req.query.isActive as string;
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
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const [customers, total] = await Promise.all([
      CustomerModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      CustomerModel.countDocuments(query)
    ]);

    const response: ApiResponse<ICustomerModel[]> = {
      success: true,
      message: 'Customers retrieved successfully',
      data: customers,
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
   * Get customer by ID
   * @route GET /api/customers/:id
   */
  getCustomerById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const customer = await CustomerModel.findById(id).lean().exec();

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const response: ApiResponse<ICustomerModel> = {
      success: true,
      message: 'Customer retrieved successfully',
      data: customer,
    };

    res.status(200).json(response);
  });

  /**
   * Update customer
   * @route PATCH /api/customers/:id
   */
  updateCustomer = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updateData = req.body as UpdateCustomerDto;

    // Remove undefined values and trim strings
    const cleanedData: Partial<ICustomerModel> = {};
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanedData[key as keyof ICustomerModel] = typeof value === 'string' 
          ? value.trim() 
          : value;
      }
    });

    // Handle email uniqueness if being updated
    if (cleanedData.email) {
      const existingCustomer = await CustomerModel.findOne({ 
        email: cleanedData.email,
        _id: { $ne: id }
      }).exec();
      
      if (existingCustomer) {
        throw new AppError('Customer with this email already exists', 409);
      }
      
      cleanedData.email = cleanedData.email.toLowerCase();
    }

    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
      id,
      cleanedData,
      { 
        new: true, 
        runValidators: true 
      }
    ).lean().exec();

    if (!updatedCustomer) {
      throw new AppError('Customer not found', 404);
    }

    const response: ApiResponse<ICustomerModel> = {
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer,
    };

    res.status(200).json(response);
  });

  /**
   * Delete customer
   * @route DELETE /api/customers/:id
   */
  deleteCustomer = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const deletedCustomer = await CustomerModel.findByIdAndDelete(id).exec();

    if (!deletedCustomer) {
      throw new AppError('Customer not found', 404);
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Customer deleted successfully',
      data: null,
    };

    res.status(200).json(response);
  });

  /**
   * Get customer statistics
   * @route GET /api/customers/stats
   */
  getCustomerStats = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const totalCustomers = await CustomerModel.countDocuments().exec();
    
    // Get customers created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCustomers = await CustomerModel.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    }).exec();

    const response: ApiResponse<{ total: number; recent: number }> = {
      success: true,
      message: 'Customer statistics retrieved successfully',
      data: {
        total: totalCustomers,
        recent: recentCustomers
      },
    };

    res.status(200).json(response);
  });
}

export default new CustomerController();