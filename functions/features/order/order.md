Here's the comprehensive API documentation for your Order Service:

# Order API Documentation

## Base URL
`https://your-api-domain.com/api/order`

## Authentication
- Requires valid JWT token in Authorization header
- Roles:
  - Consumers can access their own orders
  - Vendors can access their restaurant's orders
  - Admins have full access
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Order
**Endpoint:** `POST /`  
**Description:** Create a new order  
**Request Body:**
```json
{
  "consumer": "507f1f77bcf86cd799439011",
  "vendor": "609b0b0e1c9d440000f4e7d1",
  "items": [
    {
      "foodItem": "609b0b0e1c9d440000f4e7d2",
      "quantity": 2
    }
  ],
  "totalPrice": 25.98,
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```
**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "709b0b0e1c9d440000f4e7d3",
    "consumer": "507f1f77bcf86cd799439011",
    "vendor": "609b0b0e1c9d440000f4e7d1",
    "items": [
      {
        "foodItem": "609b0b0e1c9d440000f4e7d2",
        "quantity": 2,
        "_id": "809b0b0e1c9d440000f4e7d4"
      }
    ],
    "totalPrice": 25.98,
    "status": "pending",
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "createdAt": "2023-05-15T10:00:00.000Z"
  }
}
```

### 2. Get All Orders
**Endpoint:** `GET /`  
**Description:** Get paginated list of orders with filters  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (pending/accepted/preparing/ready/delivered/cancelled)
- `from` (optional): Filter orders after this date (ISO format)
- `to` (optional): Filter orders before this date (ISO format)

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "709b0b0e1c9d440000f4e7d3",
      "consumer": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "vendor": {
        "_id": "609b0b0e1c9d440000f4e7d1",
        "name": "Pizza Palace",
        "email": "info@pizzapalace.com"
      },
      "totalPrice": 25.98,
      "status": "pending",
      "createdAt": "2023-05-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10
  }
}
```

### 3. Get Order by ID
**Endpoint:** `GET /:id`  
**Description:** Get single order by ID  
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "709b0b0e1c9d440000f4e7d3",
    "consumer": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "vendor": {
      "_id": "609b0b0e1c9d440000f4e7d1",
      "name": "Pizza Palace",
      "email": "info@pizzapalace.com"
    },
    "items": [
      {
        "foodItem": {
          "_id": "609b0b0e1c9d440000f4e7d2",
          "name": "Margherita Pizza",
          "price": 12.99
        },
        "quantity": 2
      }
    ],
    "totalPrice": 25.98,
    "status": "pending",
    "deliveryAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001"
    },
    "createdAt": "2023-05-15T10:00:00.000Z",
    "updatedAt": "2023-05-15T10:00:00.000Z"
  }
}
```

### 4. Update Order Status
**Endpoint:** `PATCH /:id/status`  
**Description:** Update order status  
**Request Body:**
```json
{
  "status": "accepted"
}
```
**Valid Status Values:** pending, accepted, preparing, ready, delivered, cancelled  
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "709b0b0e1c9d440000f4e7d3",
    "status": "accepted",
    "updatedAt": "2023-05-15T11:00:00.000Z"
  },
  "message": "Order status updated to accepted"
}
```

### 5. Get Orders by Consumer
**Endpoint:** `GET /consumer/:consumerId`  
**Description:** Get orders for specific consumer  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "709b0b0e1c9d440000f4e7d3",
      "vendor": {
        "name": "Pizza Palace"
      },
      "totalPrice": 25.98,
      "status": "pending",
      "createdAt": "2023-05-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

### 6. Get Orders by Vendor
**Endpoint:** `GET /vendor/:vendorId`  
**Description:** Get orders for specific vendor  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "709b0b0e1c9d440000f4e7d3",
      "consumer": {
        "name": "John Doe"
      },
      "totalPrice": 25.98,
      "status": "pending",
      "createdAt": "2023-05-15T10:00:00.000Z"
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 10
  }
}
```

## Error Responses

### Common Error Responses
- **400 Bad Request**: Invalid ID format, missing required fields, or invalid status
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User doesn't have access to the requested resource
- **404 Not Found**: Order not found
- **500 Internal Server Error**: Server error

### Example Error Response
```json
{
  "success": false,
  "error": "Invalid status value",
  "statusCode": 400,
  "validStatusValues": ["pending", "accepted", "preparing", "ready", "delivered", "cancelled"]
}
```

## Data Validation Rules
- `consumer`: Required, valid MongoDB ID (must be existing user)
- `vendor`: Required, valid MongoDB ID (must be existing vendor)
- `items`: Required, array with at least one item
  - `foodItem`: Required, valid MongoDB ID (must be existing food item)
  - `quantity`: Required, number (min: 1)
- `totalPrice`: Required, number (min: 0.01)
- `deliveryAddress`: Required object with:
  - `street`: Required, string
  - `city`: Required, string
  - `state`: Required, string
  - `zipCode`: Required, string

## Rate Limiting
- 100 requests per 15 minutes per IP address for read endpoints
- 30 requests per 15 minutes per IP address for write endpoints

## Notes
- Orders are immutable except for status updates
- Status transitions are validated (e.g., can't move from "delivered" to "preparing")
- All timestamps are in UTC
- Consumers can only access their own orders
- Vendors can only access orders for their restaurant