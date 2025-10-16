import { IUser } from '../models/user.model';

// Re-export a simpler User type for controllers that import from src/types
export type User = IUser;

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface UploadedFileInfo {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
  url: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
}

// User Types


export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: IUser;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

// Category Entity
export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  images: string[];
  parentId?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  slug?: string;
  images?: string[];
  parentId?: string | null;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  slug?: string;
  images?: string[];
  parentId?: string | null;
  isActive?: boolean;
}

// Item Entity
export interface Item {
  id: string;
  name: string;
  description: string;
  slug: string;
  categoryId: string;
  image?: string;
  tags: string[];
  attributes: Record<string, any>;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateItemDto {
  name: string;
  description: string;
  slug?: string;
  categoryId: string;
  image?: string;
  tags?: string[];
  attributes?: Record<string, any>;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface UpdateItemDto {
  name?: string;
  description?: string;
  slug?: string;
  categoryId?: string;
  image?: string;
  tags?: string[];
  attributes?: Record<string, any>;
  isActive?: boolean;
  isFeatured?: boolean;
}

// Size Entity
export interface Size {
  id: string;
  name: string; // e.g., 'S', 'M', 'L', '10 US'
  code?: string; // optional short code
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSizeDto {
  name: string;
  code?: string;
}

export interface UpdateSizeDto {
  name?: string;
  code?: string;
}

// Color Entity
export interface Color {
  id: string;
  name: string; // e.g., 'Red', 'Blue'
  hex?: string; // e.g., '#FF0000'
  rgb?: string; // e.g., 'rgb(255,0,0)'
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateColorDto {
  name: string;
  hex?: string;
  rgb?: string;
}

export interface UpdateColorDto {
  name?: string;
  hex?: string;
  rgb?: string;
}

// Query Parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
