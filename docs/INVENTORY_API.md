# Inventory API Documentation

## Overview
The Inventory API manages product variants with different sizes and colors, tracking stock levels, prices, and SKUs for each combination.

## Base URL
```
http://localhost:3000/api/inventory
```

## Endpoints

### 1. Get All Inventory Items
Retrieve all inventory items with pagination and filtering.

**Endpoint:** `GET /api/inventory`

**Access:** Public

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by SKU, barcode, or tags
- `sortBy` (optional): Field to sort by (default: 'createdAt')
- `sortOrder` (optional): 'asc' or 'desc' (default: 'desc')

**Success Response (200):**
```json
{
  "success": true,
  "message": "Retrieved 5 inventory items",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "item": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Classic T-Shirt",
        "description": "Comfortable cotton t-shirt",
        "slug": "classic-t-shirt",
        "images": ["image1.jpg", "image2.jpg"]
      },
      "size": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "M",
        "code": "MD"
      },
      "color": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Blue",
        "hex": "#0000FF",
        "rgb": "rgb(0,0,255)"
      },
      "price": 29.99,
      "compareAtPrice": 39.99,
      "costPrice": 15.00,
      "stock": 100,
      "sku": "TSH-BLU-M-001",
      "barcode": "1234567890123",
      "tags": ["summer", "casual"],
      "attributes": {
        "material": "cotton",
        "weight": "150g"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 2. Get Inventory by ID
Retrieve a specific inventory item by its ID.

**Endpoint:** `GET /api/inventory/:id`

**Access:** Public

**URL Parameters:**
- `id`: Inventory item MongoDB ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Inventory item retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "item": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Classic T-Shirt",
      "description": "Comfortable cotton t-shirt",
      "slug": "classic-t-shirt",
      "images": ["image1.jpg"]
    },
    "size": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "M"
    },
    "color": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Blue",
      "hex": "#0000FF"
    },
    "price": 29.99,
    "stock": 100,
    "sku": "TSH-BLU-M-001"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Inventory item not found",
  "statusCode": 404
}
```

---

### 3. Get Inventory by Item ID
Retrieve all inventory variants for a specific item (all size/color combinations).

**Endpoint:** `GET /api/inventory/item/:itemId`

**Access:** Public

**URL Parameters:**
- `itemId`: Item MongoDB ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Retrieved 6 inventory items for this product",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "size": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "S"
      },
      "color": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Blue"
      },
      "price": 29.99,
      "stock": 50
    },
    {
      "_id": "507f1f77bcf86cd799439015",
      "size": {
        "_id": "507f1f77bcf86cd799439016",
        "name": "M"
      },
      "color": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "Blue"
      },
      "price": 29.99,
      "stock": 100
    }
  ]
}
```

---

### 4. Create Inventory Item
Create a new inventory item (product variant).

**Endpoint:** `POST /api/inventory`

**Access:** Public

**Request Body:**
```json
{
  "item": "507f1f77bcf86cd799439012",
  "size": "507f1f77bcf86cd799439013",
  "color": "507f1f77bcf86cd799439014",
  "price": 29.99,
  "compareAtPrice": 39.99,
  "costPrice": 15.00,
  "stock": 100,
  "sku": "TSH-BLU-M-001",
  "barcode": "1234567890123",
  "tags": ["summer", "casual"],
  "attributes": {
    "material": "cotton",
    "weight": "150g"
  }
}
```

**Required Fields:**
- `item`: Item reference (MongoDB ID)
- `size`: Size reference (MongoDB ID)
- `color`: Color reference (MongoDB ID)
- `price`: Product price (number, min: 0)
- `stock`: Stock quantity (integer, min: 0)

**Optional Fields:**
- `compareAtPrice`: Original price for comparison
- `costPrice`: Cost price for margin calculation
- `sku`: Stock keeping unit
- `barcode`: Product barcode
- `tags`: Array of tags
- `attributes`: Custom attributes object

**Success Response (201):**
```json
{
  "success": true,
  "message": "Inventory item created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "item": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Classic T-Shirt"
    },
    "size": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "M"
    },
    "color": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Blue"
    },
    "price": 29.99,
    "stock": 100,
    "sku": "TSH-BLU-M-001"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Inventory item with this combination of item, size, and color already exists",
  "statusCode": 400
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Item not found",
  "statusCode": 404
}
```

---

### 5. Update Inventory Item
Update an existing inventory item.

**Endpoint:** `PUT /api/inventory/:id`

**Access:** Public

**URL Parameters:**
- `id`: Inventory item MongoDB ID

**Request Body:** (all fields optional)
```json
{
  "price": 34.99,
  "compareAtPrice": 44.99,
  "stock": 150,
  "sku": "TSH-BLU-M-002",
  "tags": ["summer", "casual", "bestseller"],
  "attributes": {
    "material": "organic cotton",
    "weight": "160g"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Inventory item updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "price": 34.99,
    "stock": 150
  }
}
```

---

### 6. Update Stock Quantity
Update only the stock quantity (quick stock adjustment).

**Endpoint:** `PATCH /api/inventory/:id/stock`

**Access:** Public

**URL Parameters:**
- `id`: Inventory item MongoDB ID

**Request Body:**
```json
{
  "stock": 75
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "stock": 75
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Stock cannot be negative",
  "statusCode": 400
}
```

---

### 7. Increment Stock Quantity
Increase stock quantity by a specified amount (useful for restocking).

**Endpoint:** `PATCH /api/inventory/:id/stock/increment`

**Access:** Public

**URL Parameters:**
- `id`: Inventory item MongoDB ID

**Request Body:**
```json
{
  "quantity": 50
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Stock incremented by 50. Previous: 25, Current: 75",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "item": {
      "name": "Classic T-Shirt"
    },
    "size": {
      "name": "M"
    },
    "color": {
      "name": "Blue"
    },
    "stock": 75,
    "sku": "TSH-BLU-M-001"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Increment quantity must be positive",
  "statusCode": 400
}
```

---

### 8. Decrement Stock Quantity
Decrease stock quantity by a specified amount (useful for sales/reservations).

**Endpoint:** `PATCH /api/inventory/:id/stock/decrement`

**Access:** Public

**URL Parameters:**
- `id`: Inventory item MongoDB ID

**Request Body:**
```json
{
  "quantity": 10
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Stock decremented by 10. Previous: 75, Current: 65",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "item": {
      "name": "Classic T-Shirt"
    },
    "size": {
      "name": "M"
    },
    "color": {
      "name": "Blue"
    },
    "stock": 65,
    "sku": "TSH-BLU-M-001"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot decrement stock by 100. Current stock: 65. Insufficient stock.",
  "statusCode": 400
}
```

---

### 9. Delete Inventory Item
Delete an inventory item.

**Endpoint:** `DELETE /api/inventory/:id`

**Access:** Public

**URL Parameters:**
- `id`: Inventory item MongoDB ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Inventory item deleted successfully"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Inventory item not found",
  "statusCode": 404
}
```

---

### 10. Get Low Stock Items
Retrieve inventory items with stock below a threshold.

**Endpoint:** `GET /api/inventory/low-stock`

**Access:** Public

**Query Parameters:**
- `threshold` (optional): Stock threshold (default: 10)

**Example:** `GET /api/inventory/low-stock?threshold=20`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Retrieved 3 low stock items",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "item": {
        "name": "Classic T-Shirt"
      },
      "size": {
        "name": "XL"
      },
      "color": {
        "name": "Red"
      },
      "stock": 5,
      "sku": "TSH-RED-XL-001"
    }
  ]
}
```

---

## Example Usage

### Using curl

**Create Inventory:**
```bash
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "item": "507f1f77bcf86cd799439012",
    "size": "507f1f77bcf86cd799439013",
    "color": "507f1f77bcf86cd799439014",
    "price": 29.99,
    "stock": 100,
    "sku": "TSH-BLU-M-001"
  }'
```

**Get All Inventory:**
```bash
curl -X GET "http://localhost:3000/api/inventory?page=1&limit=10"
```

**Get Inventory for Specific Item:**
```bash
curl -X GET http://localhost:3000/api/inventory/item/507f1f77bcf86cd799439012
```

**Update Stock:**
```bash
curl -X PATCH http://localhost:3000/api/inventory/507f1f77bcf86cd799439011/stock \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 75
  }'
```

**Increment Stock:**
```bash
curl -X PATCH http://localhost:3000/api/inventory/507f1f77bcf86cd799439011/stock/increment \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 50
  }'
```

**Decrement Stock:**
```bash
curl -X PATCH http://localhost:3000/api/inventory/507f1f77bcf86cd799439011/stock/decrement \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 10
  }'
```

**Get Low Stock:**
```bash
curl -X GET "http://localhost:3000/api/inventory/low-stock?threshold=20"
```

### Using PowerShell

**Create Inventory:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory" `
  -Method Post `
  -ContentType "application/json" `
  -Body (@{
    item = "507f1f77bcf86cd799439012"
    size = "507f1f77bcf86cd799439013"
    color = "507f1f77bcf86cd799439014"
    price = 29.99
    stock = 100
    sku = "TSH-BLU-M-001"
  } | ConvertTo-Json)
```

**Update Stock:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/507f1f77bcf86cd799439011/stock" `
  -Method Patch `
  -ContentType "application/json" `
  -Body (@{
    stock = 75
  } | ConvertTo-Json)
```

**Increment Stock:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/507f1f77bcf86cd799439011/stock/increment" `
  -Method Patch `
  -ContentType "application/json" `
  -Body (@{
    quantity = 50
  } | ConvertTo-Json)
```

**Decrement Stock:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/inventory/507f1f77bcf86cd799439011/stock/decrement" `
  -Method Patch `
  -ContentType "application/json" `
  -Body (@{
    quantity = 10
  } | ConvertTo-Json)
```

---

## Validation Rules

### Create Inventory
- `item`: Required, must be valid MongoDB ID
- `size`: Required, must be valid MongoDB ID
- `color`: Required, must be valid MongoDB ID
- `price`: Required, must be >= 0
- `stock`: Required, must be >= 0
- `compareAtPrice`: Optional, must be >= 0
- `costPrice`: Optional, must be >= 0
- `sku`: Optional, max 100 characters
- `barcode`: Optional, max 100 characters
- `tags`: Optional, must be array of strings
- `attributes`: Optional, must be object

### Update Inventory
- All fields optional
- Same validation rules as create for provided fields

### Update Stock
- `stock`: Required, must be >= 0

### Increment Stock
- `quantity`: Required, must be > 0

### Decrement Stock
- `quantity`: Required, must be > 0
- Cannot exceed current stock level

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error: price: Price must be a positive number",
  "statusCode": 400
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Inventory item not found",
  "statusCode": 404
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## Business Logic

### Unique Constraint
Each combination of `item`, `size`, and `color` must be unique. Attempting to create a duplicate will result in a 400 error.

### Reference Validation
The API validates that:
- Item reference exists in the Items collection
- Size reference exists in the Sizes collection
- Color reference exists in the Colors collection

### Stock Management
- Stock cannot be negative
- Use the PATCH `/inventory/:id/stock` endpoint for quick stock updates
- Use the GET `/inventory/low-stock` endpoint to monitor inventory levels

---

## Notes
- All dates are in ISO 8601 format
- All prices should be in the smallest currency unit (e.g., cents)
- MongoDB IDs are 24-character hexadecimal strings
- Pagination is zero-indexed on the backend but one-indexed in the API
