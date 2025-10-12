# Item & Category CRUD API Documentation

## Overview

This API provides complete CRUD (Create, Read, Update, Delete) operations for Items and Categories with proper TypeScript types, validation, and image field support.

## Base URL
```
http://localhost:3000/api
```

---

## 📦 Category API

### Data Model

```typescript
interface Category {
  id: string;                  // UUID
  name: string;                // Category name
  description: string;         // Category description
  slug: string;                // URL-friendly identifier
  images: string[];            // Array of image URLs
  parentId?: string | null;    // Parent category ID (for nested categories)
  isActive: boolean;           // Active status
  createdAt: Date;             // Creation timestamp
  updatedAt: Date;             // Last update timestamp
}
```

### Endpoints

#### 1. Get All Categories
```http
GET /api/categories
```

**Query Parameters:**
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Search in name and description
- `isActive` (boolean, optional): Filter by active status
- `sortBy` (string, optional): Field to sort by (default: createdAt)
- `sortOrder` ('asc' | 'desc', optional): Sort order (default: desc)

**Example Request:**
```bash
curl "http://localhost:3000/api/categories?page=1&limit=10&search=electronics"
```

**Response:**
```json
{
  "success": true,
  "message": "Retrieved 2 categories",
  "data": [
    {
      "id": "uuid-here",
      "name": "Electronics",
      "description": "Electronic devices and gadgets",
      "slug": "electronics",
      "images": ["/uploads/electronics.jpg"],
      "parentId": null,
      "isActive": true,
      "createdAt": "2025-10-03T10:00:00.000Z",
      "updatedAt": "2025-10-03T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

#### 2. Get Category by ID
```http
GET /api/categories/:id
```

**Example Request:**
```bash
curl "http://localhost:3000/api/categories/uuid-here"
```

**Response:**
```json
{
  "success": true,
  "message": "Category retrieved successfully",
  "data": {
    "id": "uuid-here",
    "name": "Electronics",
    "description": "Electronic devices and gadgets",
    "slug": "electronics",
    "images": ["/uploads/electronics.jpg"],
    "parentId": null,
    "isActive": true,
    "createdAt": "2025-10-03T10:00:00.000Z",
    "updatedAt": "2025-10-03T10:00:00.000Z"
  }
}
```

#### 3. Create Category
```http
POST /api/categories
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Smartphones",
  "description": "Mobile phones and accessories",
  "slug": "smartphones",
  "images": [
    "/uploads/phone1.jpg",
    "/uploads/phone2.jpg"
  ],
  "parentId": "electronics-uuid",
  "isActive": true
}
```

**Required Fields:**
- `name` (string, 2-100 chars)
- `description` (string, min 10 chars)

**Optional Fields:**
- `slug` (string, auto-generated if not provided)
- `images` (string array)
- `parentId` (UUID string)
- `isActive` (boolean, default: true)

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "new-uuid",
    "name": "Smartphones",
    "description": "Mobile phones and accessories",
    "slug": "smartphones",
    "images": ["/uploads/phone1.jpg", "/uploads/phone2.jpg"],
    "parentId": "electronics-uuid",
    "isActive": true,
    "createdAt": "2025-10-03T10:00:00.000Z",
    "updatedAt": "2025-10-03T10:00:00.000Z"
  }
}
```

#### 4. Update Category
```http
PUT /api/categories/:id
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "images": ["/uploads/new-image.jpg"],
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "data": { /* updated category */ }
}
```

#### 5. Delete Category
```http
DELETE /api/categories/:id
```

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/categories/uuid-here"
```

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Note:** Cannot delete categories with existing items.

#### 6. Get Category with Items
```http
GET /api/categories/:id/items
```

**Response:**
```json
{
  "success": true,
  "message": "Category and items retrieved successfully",
  "data": {
    "category": { /* category object */ },
    "items": [ /* array of items */ ]
  }
}
```

---

## 🛍️ Item API

### Data Model

```typescript
interface Item {
  id: string;                      // UUID
  name: string;                    // Item name
  description: string;             // Item description
  slug: string;                    // URL-friendly identifier
  price: number;                   // Item price
  compareAtPrice?: number | null;  // Original price for comparison
  costPrice?: number | null;       // Cost price
  sku: string;                     // Stock Keeping Unit
  barcode?: string | null;         // Product barcode
  quantity: number;                // Stock quantity
  categoryId: string;              // Category UUID
  images: string[];                // Array of image URLs
  tags: string[];                  // Array of tags
  attributes: Record<string, any>; // Custom attributes (color, size, etc.)
  isActive: boolean;               // Active status
  isFeatured: boolean;             // Featured status
  createdAt: Date;                 // Creation timestamp
  updatedAt: Date;                 // Last update timestamp
}
```

### Endpoints

#### 1. Get All Items
```http
GET /api/items
```

**Query Parameters:**
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `search` (string, optional): Search in name, description, tags
- `categoryId` (string, optional): Filter by category
- `isActive` (boolean, optional): Filter by active status
- `sortBy` (string, optional): Field to sort by
- `sortOrder` ('asc' | 'desc', optional): Sort order

**Example Request:**
```bash
curl "http://localhost:3000/api/items?page=1&limit=10&categoryId=uuid-here"
```

**Response:**
```json
{
  "success": true,
  "message": "Retrieved 2 items",
  "data": [
    {
      "id": "uuid",
      "name": "Wireless Headphones",
      "description": "Premium wireless headphones with noise cancellation",
      "slug": "wireless-headphones",
      "price": 199.99,
      "compareAtPrice": 249.99,
      "costPrice": 120.00,
      "sku": "WH-001",
      "barcode": "1234567890123",
      "quantity": 50,
      "categoryId": "category-uuid",
      "images": [
        "/uploads/headphones-1.jpg",
        "/uploads/headphones-2.jpg"
      ],
      "tags": ["electronics", "audio", "wireless"],
      "attributes": {
        "color": "Black",
        "battery": "30 hours",
        "wireless": true
      },
      "isActive": true,
      "isFeatured": true,
      "createdAt": "2025-10-03T10:00:00.000Z",
      "updatedAt": "2025-10-03T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

#### 2. Get Item by ID
```http
GET /api/items/:id
```

**Example Request:**
```bash
curl "http://localhost:3000/api/items/uuid-here"
```

#### 3. Create Item
```http
POST /api/items
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Smart Watch",
  "description": "Advanced fitness tracking smartwatch with GPS",
  "slug": "smart-watch",
  "price": 299.99,
  "compareAtPrice": 349.99,
  "costPrice": 180.00,
  "sku": "SW-001",
  "barcode": "9876543210987",
  "quantity": 30,
  "categoryId": "electronics-uuid",
  "images": [
    "/uploads/watch-1.jpg",
    "/uploads/watch-2.jpg",
    "/uploads/watch-3.jpg"
  ],
  "tags": ["smartwatch", "fitness", "wearable"],
  "attributes": {
    "color": "Silver",
    "display": "AMOLED",
    "waterproof": true,
    "batteryLife": "7 days"
  },
  "isActive": true,
  "isFeatured": true
}
```

**Required Fields:**
- `name` (string, 3-200 chars)
- `description` (string, min 10 chars)
- `price` (number, >= 0)
- `sku` (string, 2-50 chars)
- `categoryId` (UUID string)

**Optional Fields:**
- `slug` (string, auto-generated if not provided)
- `compareAtPrice` (number)
- `costPrice` (number)
- `barcode` (string)
- `quantity` (number, default: 0)
- `images` (string array)
- `tags` (string array)
- `attributes` (object)
- `isActive` (boolean, default: true)
- `isFeatured` (boolean, default: false)

**Response:**
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": { /* created item */ }
}
```

#### 4. Update Item
```http
PUT /api/items/:id
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "price": 279.99,
  "quantity": 25,
  "images": [
    "/uploads/watch-1-new.jpg",
    "/uploads/watch-2-new.jpg"
  ],
  "isFeatured": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Item updated successfully",
  "data": { /* updated item */ }
}
```

#### 5. Delete Item
```http
DELETE /api/items/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

#### 6. Get Items by Category
```http
GET /api/items/category/:categoryId
```

**Example Request:**
```bash
curl "http://localhost:3000/api/items/category/electronics-uuid"
```

**Response:**
```json
{
  "success": true,
  "message": "Found 5 items in this category",
  "data": [ /* array of items */ ]
}
```

---

## 🖼️ Working with Images

### Image Field Format

Both Items and Categories have an `images` field which is an **array of strings**:

```json
{
  "images": [
    "/uploads/image1.jpg",
    "/uploads/image2.jpg",
    "/uploads/image3.jpg"
  ]
}
```

### Uploading Images

1. **Upload images first** using the upload API:
```bash
curl -X POST http://localhost:3000/api/upload/multiple \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

2. **Get the URLs** from the response:
```json
{
  "success": true,
  "data": [
    {
      "url": "/uploads/filename1.jpg"
    },
    {
      "url": "/uploads/filename2.jpg"
    }
  ]
}
```

3. **Use the URLs** when creating/updating items or categories:
```json
{
  "name": "Product Name",
  "images": [
    "/uploads/filename1.jpg",
    "/uploads/filename2.jpg"
  ]
}
```

---

## ❌ Error Responses

### Validation Error
```json
{
  "success": false,
  "message": "Validation error",
  "error": "name: Name is required, price: Price must be a positive number",
  "statusCode": 400
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Item not found",
  "error": "Item not found",
  "statusCode": 404
}
```

### Category with Items Error
```json
{
  "success": false,
  "message": "Cannot delete category with existing items",
  "error": "Cannot delete category with existing items. Please delete or move items first.",
  "statusCode": 400
}
```

---

## 🧪 Testing with PowerShell

### Create a Category
```powershell
$body = @{
    name = "Electronics"
    description = "Electronic devices and accessories"
    images = @("/uploads/electronics.jpg")
    isActive = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/categories" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Create an Item
```powershell
$body = @{
    name = "Smart Phone"
    description = "Latest smartphone with advanced features"
    price = 799.99
    sku = "SP-001"
    quantity = 100
    categoryId = "category-uuid-here"
    images = @("/uploads/phone1.jpg", "/uploads/phone2.jpg")
    tags = @("smartphone", "electronics")
    attributes = @{
        color = "Black"
        storage = "128GB"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/items" `
  -Method POST `
  -Body $body `
  -ContentType "application/json"
```

### Get All Items
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/items?page=1&limit=10"
```

### Update an Item
```powershell
$body = @{
    price = 749.99
    quantity = 95
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/items/uuid-here" `
  -Method PUT `
  -Body $body `
  -ContentType "application/json"
```

### Delete an Item
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/items/uuid-here" `
  -Method DELETE
```

---

## 📊 Sample Data

The server includes sample data:
- 2 Categories (Electronics, Clothing)
- 2 Items (Wireless Headphones, Cotton T-Shirt)

Access them immediately after starting the server!

---

## 🎯 Best Practices

1. **Always upload images first**, then use the URLs in your item/category
2. **Use meaningful SKUs** for inventory management
3. **Set proper pricing**: cost < price < compareAtPrice
4. **Use tags** for better searchability
5. **Use attributes** for product-specific data
6. **Validate category exists** before creating items
7. **Handle pagination** for large datasets

---

## 🔗 Related Endpoints

- Upload API: `/api/upload/multiple` - Upload images
- Health Check: `/api/health` - Server status

---

**Happy Coding! 🚀**
