import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../../middleware/error.middleware';
import { ApiResponse } from '../../types';
import { PickupAddressCreate, AddressCreateResponse, AddressListResponse } from '../types/pickup.shiprocket';
import { createShiprocketAPI } from '../config/api.common';
import { ADD_PICKUP, LIST_PICKUP } from '../config/api.endpoints';

class ShiprocketPickupController {
  /**
   * Add a new pickup address to Shiprocket
   * @route POST /api/shiprocket/pickup/add
   */
  addPickup = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const pickupData: PickupAddressCreate = req.body;
      const authHeader = req.headers.authorization;

      // Validate authorization header
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Authorization token is required', 401);
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        throw new AppError('Invalid authorization token', 401);
      }

      // Validate required fields
      const requiredFields: (keyof PickupAddressCreate)[] = [
        'pickup_location',
        'name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'country',
        'pin_code'
      ];

      for (const field of requiredFields) {
        if (!pickupData[field]) {
          throw new AppError(`${field} is required`, 400);
        }
      }

      try {
        // Create authenticated API instance
        const shiprocketAPI = createShiprocketAPI(token);

        // Make add pickup request to Shiprocket API
        const shiprocketResponse = await shiprocketAPI.post(ADD_PICKUP, pickupData);

        const shiprocketData = shiprocketResponse.data as AddressCreateResponse;

        // Return successful response
        const response: ApiResponse<AddressCreateResponse> = {
          success: true,
          message: 'Pickup address added successfully',
          data: shiprocketData,
        };

        res.status(201).json(response);
      } catch (error: any) {
        // Handle Axios errors
        if (error.response) {
          // Shiprocket API returned an error response
          const status = error.response.status;
          const errorMessage = error.response.data?.message || 'Failed to add pickup address';

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
          throw new AppError('Internal server error during pickup address creation', 500);
        }
      }
    }
  );

  /**
   * Get list of pickup addresses from Shiprocket
   * @route GET /api/shiprocket/pickup/list
   */
  listPickup = asyncHandler(
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

        // Make list pickup request to Shiprocket API
        const shiprocketResponse = await shiprocketAPI.get(LIST_PICKUP);

        const shiprocketData = shiprocketResponse.data as AddressListResponse;

        // Return successful response
        const response: ApiResponse<AddressListResponse> = {
          success: true,
          message: 'Pickup addresses retrieved successfully',
          data: shiprocketData,
        };

        res.status(200).json(response);
      } catch (error: any) {
        // Handle Axios errors
        if (error.response) {
          // Shiprocket API returned an error response
          const status = error.response.status;
          const errorMessage = error.response.data?.message || 'Failed to retrieve pickup addresses';

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
          throw new AppError('Internal server error during pickup address retrieval', 500);
        }
      }
    }
  );
}

export default new ShiprocketPickupController();