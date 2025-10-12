import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { AuthResponse, RegisterDto, LoginDto, ApiResponse } from '../types';
import User, { IUser } from '../models/user.model';
import config from '../config';

class AuthController {
  /**
   * Generate JWT Token
   */
  private generateToken(id: string, email: string, role: string): string {
    return jwt.sign(
      { id, email, role }, 
      config.jwt.secret, 
      { expiresIn: config.jwt.expire } as jwt.SignOptions
    );
  }

  /**
   * Register new user
   * @route POST /api/auth/register
   */
  register = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { name, email, password, role }: RegisterDto = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('User already exists with this email', 400);
      }

      // Create user
      const user: IUser = await User.create({
        name,
        email,
        password,
        role: role || 'user',
      });

      // Generate token
      const token = this.generateToken(
        (user._id as any).toString(),
        user.email,
        user.role
      );

      // Remove password from response

      const response: AuthResponse = {
        success: true,
        message: 'User registered successfully',
        token,
        user: user,
      };

      res.status(201).json(response);
    }
  );

  /**
   * Login user
   * @route POST /api/auth/login
   */
  login = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { email, password }: LoginDto = req.body;

      // Validate input
      if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
      }

      // Find user and include password
      const user: IUser | null = await User.findOne({ email }).select('+password');

      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AppError('Your account has been deactivated', 403);
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }

      // Generate token
      const token = this.generateToken(
        (user._id as any).toString(),
        user.email,
        user.role
      );

      // Remove password from response


      const response: AuthResponse = {
        success: true,
        message: 'Login successful',
        token,
        user: user,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Get current user profile
   * @route GET /api/auth/me
   */
  getMe = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const user: IUser | null = await User.findById(req.user._id);

      if (!user) {
        throw new AppError('User not found', 404);
      }



      const response: ApiResponse<IUser> = {
        success: true,
        message: 'User profile retrieved successfully',
        data: user,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Update user profile
   * @route PUT /api/auth/me
   */
  updateProfile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { name, avatar } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (avatar) updateData.avatar = avatar;

      const user: IUser | null = await User.findByIdAndUpdate(
        req.user._id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!user) {
        throw new AppError('User not found', 404);
      }



      const response: ApiResponse<IUser> = {
        success: true,
        message: 'Profile updated successfully',
        data: user,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Change password
   * @route PUT /api/auth/change-password
   */
  changePassword = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError(
          'Please provide current password and new password',
          400
        );
      }

      if (newPassword.length < 6) {
        throw new AppError('New password must be at least 6 characters', 400);
      }

      // Get user with password
      const user: IUser | null = await User.findById(req.user._id).select('+password');

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);

      if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 401);
      }

      // Update password
      user.password = newPassword;
      await user.save();

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully',
      };

      res.status(200).json(response);
    }
  );

  /**
   * Get all users (admin only)
   * @route GET /api/auth/users
   */
  getAllUsers = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const users = await User.find().select('-password');


      const response: ApiResponse<IUser[]> = {
        success: true,
        message: `Retrieved ${users.length} users`,
        data: users,
      };

      res.status(200).json(response);
    }
  );
}

export default new AuthController();
