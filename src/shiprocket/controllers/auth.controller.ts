import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../../middleware/error.middleware';
import { ApiResponse } from '../../types';
import { AuthRequest, AuthResponse } from '../types/auth.type';
import { authAPI, createShiprocketAPI } from '../config/api.common';
import { LOGIN, LOG_OUT } from '../config/api.endpoints';

class ShiprocketAuthController {
  /**
   * Login to Shiprocket and get authentication token
   * @route POST /api/shiprocket/auth/login
   */
  login = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { email, password }: AuthRequest = req.body;

      // Validate required fields
      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }

      try {
        // Make request to Shiprocket API using common API
        const shiprocketResponse = await authAPI(LOGIN, {
          email,
          password,
        });

        const shiprocketData = shiprocketResponse.data as AuthResponse;

        // Validate response structure
        if (!shiprocketData.token) {
          throw new AppError('Invalid response from Shiprocket API', 500);
        }

        // Return successful response
        const response: ApiResponse<AuthResponse> = {
          success: true,
          message: 'Shiprocket login successful',
          data: shiprocketData,
        };

        res.status(200).json(response);
      } catch (error: any) {
        // Handle Axios errors
        if (error.response) {
          // Shiprocket API returned an error response
          const status = error.response.status;
          const errorMessage = error.response.data?.message || 'Authentication failed';

          if (status === 401) {
            throw new AppError('Invalid Shiprocket credentials', 401);
          } else if (status === 422) {
            throw new AppError(`Validation error: ${errorMessage}`, 422);
          } else if (status >= 500) {
            throw new AppError('Shiprocket service unavailable', 503);
          } else {
            throw new AppError(`Shiprocket API error: ${errorMessage}`, status);
          }
        } else if (error.request) {
          // Network error or timeout
          throw new AppError('Unable to connect to Shiprocket service', 503);
        } else if (error instanceof AppError) {
          // Re-throw our custom errors
          throw error;
        } else {
          // Other unexpected errors
          throw new AppError('Internal server error during Shiprocket authentication', 500);
        }
      }
    }
  );

  /**
   * Logout from Shiprocket and invalidate token
   * @route POST /api/shiprocket/auth/logout
   */
  logout = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const authHeader = req.headers.authorization;

      // Validate authorization header
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Authorization token is required', 401);
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        throw new AppError('Invalid authorization token', 401);
      }

      try {
        // Create authenticated API instance
        const shiprocketAPI = createShiprocketAPI(token);

        // Make logout request to Shiprocket API
        await shiprocketAPI.post(LOG_OUT, {});

        // Return successful response
        const response: ApiResponse<null> = {
          success: true,
          message: 'Shiprocket logout successful',
          data: null,
        };

        res.status(200).json(response);
      } catch (error: any) {
        // Handle Axios errors
        if (error.response) {
          // Shiprocket API returned an error response
          const status = error.response.status;
          const errorMessage = error.response.data?.message || 'Logout failed';

          if (status === 401) {
            throw new AppError('Invalid or expired token', 401);
          } else if (status === 422) {
            throw new AppError(`Validation error: ${errorMessage}`, 422);
          } else if (status >= 500) {
            throw new AppError('Shiprocket service unavailable', 503);
          } else {
            throw new AppError(`Shiprocket API error: ${errorMessage}`, status);
          }
        } else if (error.request) {
          // Network error or timeout
          throw new AppError('Unable to connect to Shiprocket service', 503);
        } else if (error instanceof AppError) {
          // Re-throw our custom errors
          throw error;
        } else {
          // Other unexpected errors
          throw new AppError('Internal server error during Shiprocket logout', 500);
        }
      }
    }
  );
}

export default new ShiprocketAuthController();