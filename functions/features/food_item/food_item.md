Here's the comprehensive README documentation for your Food Item API endpoints:

# Food Item API Documentation

## Base URL
`https://your-api-domain.com/api/food-item`

## Authentication
- Requires valid JWT token in Authorization header
- Vendor role required for create, update, delete operations
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Food Item
**Endpoint:** `POST /`  
**Description:** Create a new food item  
**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato sauce and mozzarella",
  "price": 12.99,
  "vendor": "507f1f77bcf86cd799439011",
  "image": "https://example.com/pizza.jpg",
  "category": "Italian",
  "available": true
}
```
**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "609b0b0e1c9d440000f4e7d1",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce and mozzarella",
    "price": 12.99,
    "vendor": "507f1f77bcf86cd799439011",
    "image": "https://example.com/pizza.jpg",
    "category": "Italian",
    "available": true,
    "createdAt": "2023-05-15T10:00:00.000Z",
    "updatedAt": "2023-05-15T10:00:00.000Z"
  }
}
```

### 2. Get All Food Items
**Endpoint:** `GET /`  
**Description:** Get paginated list of food items  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `available` (optional): Filter by availability (true/false)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "609b0b0e1c9d440000f4e7d1",
      "name": "Margherita Pizza",
      "description": "Classic pizza with tomato sauce and mozzarella",
      "price": 12.99,
      "image": "https://example.com/pizza.jpg",
      "category": "Italian",
      "available": true
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

### 3. Get Food Item by ID
**Endpoint:** `GET /:id`  
**Description:** Get single food item by ID  
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "609b0b0e1c9d440000f4e7d1",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce and mozzarella",
    "price": 12.99,
    "vendor": "507f1f77bcf86cd799439011",
    "image": "https://example.com/pizza.jpg",
    "category": "Italian",
    "available": true,
    "createdAt": "2023-05-15T10:00:00.000Z",
    "updatedAt": "2023-05-15T10:00:00.000Z"
  }
}
```

### 4. Update Food Item
**Endpoint:** `PUT /:id`  
**Description:** Update food item by ID  
**Request Body:**
```json
{
  "price": 14.99,
  "available": false
}
```
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "609b0b0e1c9d440000f4e7d1",
    "name": "Margherita Pizza",
    "price": 14.99,
    "available": false,
    "updatedAt": "2023-05-15T11:00:00.000Z"
  }
}
```

### 5. Delete Food Item
**Endpoint:** `DELETE /:id`  
**Description:** Delete food item by ID  
**Success Response (200):**
```json
{
  "success": true,
  "message": "Food item deleted successfully"
}
```

### 6. Get Food Items by Vendor
**Endpoint:** `GET /vendor/:vendorId`  
**Description:** Get food items for specific vendor  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "609b0b0e1c9d440000f4e7d1",
      "name": "Margherita Pizza",
      "price": 12.99,
      "image": "https://example.com/pizza.jpg"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

## Error Responses

### Common Error Responses
- **400 Bad Request**: Invalid ID format or missing required fields
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't have vendor privileges
- **404 Not Found**: Food item not found
- **500 Internal Server Error**: Server error

### Example Error Response
```json
{
  "success": false,
  "error": "Food item not found",
  "statusCode": 404
}
```

## Data Validation Rules
- `name`: Required, string (3-100 chars)
- `description`: Required, string (10-500 chars)
- `price`: Required, number (min: 0.01)
- `vendor`: Required, valid MongoDB ID
- `image`: Optional, valid URL
- `category`: Optional, string
- `available`: Optional, boolean (default: true)

## Rate Limiting
- 100 requests per 15 minutes per IP address for read endpoints
- 30 requests per 15 minutes per IP address for write endpoints

This documentation provides a complete reference for all food item API endpoints, including examples of requests and responses, error handling, and authentication requirements.