import axios from 'axios';

// Shiprocket API configuration
const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// Create axios instance for Shiprocket API
const shiprocketAxios = axios.create({
  baseURL: SHIPROCKET_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
shiprocketAxios.interceptors.request.use(
  (config: any) => {
    console.log(`[Shiprocket API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: any) => {
    console.error('[Shiprocket API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging and error handling
shiprocketAxios.interceptors.response.use(
  (response: any) => {
    console.log(`[Shiprocket API] ${response.status} ${response.config.url}`);
    return response;
  },
  (error: any) => {
    console.error(`[Shiprocket API] Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

/**
 * API for authentication requests (no token required)
 * @param endpoint - API endpoint (e.g., '/auth/login')
 * @param body - Request body data
 * @returns Promise<any>
 */
export const authAPI = async (endpoint: string, body: any): Promise<any> => {
  try {
    const response = await shiprocketAxios.post(endpoint, body);
    return response;
  } catch (error: any) {
    throw error;
  }
};

/**
 * Common API for authenticated requests (requires token)
 * Supports GET, POST, PUT, PATCH methods
 */
export class ShiprocketAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Set or update the authentication token
   * @param token - Shiprocket authentication token
   */
  setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get authorization headers
   * @returns Authorization headers with Bearer token
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * GET request
   * @param endpoint - API endpoint
   * @param params - Query parameters (optional)
   * @returns Promise<any>
   */
  async get(endpoint: string, params?: any): Promise<any> {
    try {
      const config: any = {
        headers: this.getAuthHeaders(),
        params,
      };
      
      const response = await shiprocketAxios.get(endpoint, config);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * POST request
   * @param endpoint - API endpoint
   * @param body - Request body data
   * @param params - Query parameters (optional)
   * @returns Promise<any>
   */
  async post(endpoint: string, body: any, params?: any): Promise<any> {
    try {
      const config: any = {
        headers: this.getAuthHeaders(),
        params,
      };
      
      const response = await shiprocketAxios.post(endpoint, body, config);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * PUT request
   * @param endpoint - API endpoint
   * @param body - Request body data
   * @param params - Query parameters (optional)
   * @returns Promise<any>
   */
  async put(endpoint: string, body: any, params?: any): Promise<any> {
    try {
      const config: any = {
        headers: this.getAuthHeaders(),
        params,
      };
      
      const response = await shiprocketAxios.put(endpoint, body, config);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint
   * @param body - Request body data
   * @param params - Query parameters (optional)
   * @returns Promise<any>
   */
  async patch(endpoint: string, body: any, params?: any): Promise<any> {
    try {
      const config: any = {
        headers: this.getAuthHeaders(),
        params,
      };
      
      const response = await shiprocketAxios.patch(endpoint, body, config);
      return response;
    } catch (error: any) {
      throw error;
    }
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint
   * @param params - Query parameters (optional)
   * @returns Promise<any>
   */
  async delete(endpoint: string, params?: any): Promise<any> {
    try {
      const config: any = {
        headers: this.getAuthHeaders(),
        params,
      };
      
      const response = await shiprocketAxios.delete(endpoint, config);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

/**
 * Helper function to create an authenticated API instance
 * @param token - Shiprocket authentication token
 * @returns ShiprocketAPI instance
 */
export const createShiprocketAPI = (token: string): ShiprocketAPI => {
  return new ShiprocketAPI(token);
};

// Export the base axios instance for advanced usage
export { shiprocketAxios };

// Export common error handling function
export const handleShiprocketError = (error: any): never => {
  if (error.response) {
    // Shiprocket API returned an error response
    const status = error.response.status;
    const errorMessage = error.response.data?.message || 'Shiprocket API error';

    if (status === 401) {
      throw new Error(`Authentication failed: ${errorMessage}`);
    } else if (status === 422) {
      throw new Error(`Validation error: ${errorMessage}`);
    } else if (status >= 500) {
      throw new Error(`Shiprocket service unavailable: ${errorMessage}`);
    } else {
      throw new Error(`Shiprocket API error (${status}): ${errorMessage}`);
    }
  } else if (error.request) {
    // Network error or timeout
    throw new Error('Unable to connect to Shiprocket service. Please check your internet connection.');
  } else if (error.code === 'ECONNABORTED') {
    // Timeout error
    throw new Error('Shiprocket API request timed out. Please try again.');
  } else {
    // Other unexpected errors
    throw new Error(`Unexpected error: ${error.message}`);
  }
};