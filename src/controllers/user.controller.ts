import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse } from '../types';
import Users, { IUser } from '../models/user.model'


class UserController {
  // GET /api/users
  getAllUsers = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const users = await Users.find().select('-password').lean().exec();
    const response: ApiResponse<IUser[]> = {
      success: true,
      message: `Retrieved ${users.length} users`,
      data: users as any,
    };
    res.status(200).json(response);
  });

  // POST /api/users
  createUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const payload = req.body as any;
    if (!payload.name || !payload.email || !payload.role) {
      throw new AppError('name, email and role are required', 400);
    }



       const user =  await Users.create({
        name: payload.name,
        email: payload.email,
        role: payload.role,
        isActive: payload.isActive !== undefined ? payload.isActive : true,
        avatar: payload.avatar || '',
        type: payload.type || 'customer',
        password: payload.password || '123456',
      })


   
    const response: ApiResponse<IUser> = { success: true, message: 'User created successfully', data: user };
    res.status(201).json(response);
  });

  // PATCH /api/users/:id/status  (update isActive only)
  updateUserStatus = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const { isActive } = req.body as { isActive?: boolean };

    const existing = await Users.findById(id).exec();
    if (!existing) throw new AppError('User not found', 404);

    existing.isActive = isActive !== undefined ? isActive : existing.isActive;
    await existing.save();

    // Return user without password
    const updated = await Users.findById(id).select('-password').lean().exec();
    const response: ApiResponse<any> = { success: true, message: 'User status updated', data: updated };
    res.status(200).json(response);
  });
}

export default new UserController();
